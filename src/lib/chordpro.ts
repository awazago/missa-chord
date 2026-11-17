const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_TO_INDEX: Record<string, number> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  'E#': 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

export interface ChordSegment {
  chord?: string;
  text: string;
}

export interface ParsedLine {
  type: 'lyric' | 'comment' | 'section' | 'empty';
  segments?: ChordSegment[];
  text?: string;
}

export interface ChordProMeta {
  title?: string;
  artist?: string;
  key?: string;
  capo?: number;
}

export interface ParsedChordPro {
  meta: ChordProMeta;
  lines: ParsedLine[];
}

export function normalizeNoteIndex(note: string): number | null {
  const clean = note.trim();
  if (clean in NOTE_TO_INDEX) {
    return NOTE_TO_INDEX[clean];
  }
  return null;
}

export function transposeSingleNote(note: string, semitones: number, preferFlats = false): string {
  const idx = normalizeNoteIndex(note);
  if (idx === null) return note;
  const targetIdx = ((idx + semitones) % 12 + 12) % 12;
  const scale = preferFlats ? FLAT_SCALE : SHARP_SCALE;
  return scale[targetIdx];
}

export function transposeChord(chord: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return chord;
  const parts = chord.split('/');
  const transposedParts = parts.map((part) => {
    const match = part.trim().match(/^([A-G][#b]?)(.*)$/);
    if (!match) return part;
    const [, root, suffix] = match;
    const newRoot = transposeSingleNote(root, semitones, preferFlats);
    return `${newRoot}${suffix}`;
  });
  return transposedParts.join('/');
}

export function getSemitonesBetween(fromKey: string, toKey: string): number {
  const fromRoot = fromKey.match(/^([A-G][#b]?)/)?.[1];
  const toRoot = toKey.match(/^([A-G][#b]?)/)?.[1];
  if (!fromRoot || !toRoot) return 0;
  const fromIdx = normalizeNoteIndex(fromRoot);
  const toIdx = normalizeNoteIndex(toRoot);
  if (fromIdx === null || toIdx === null) return 0;
  return ((toIdx - fromIdx) % 12 + 12) % 12;
}

export function transposeChordPro(chordPro: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return chordPro;

  return chordPro
    .split('\n')
    .map((line) => {
      const keyDirective = line.match(/^\{(?:key|k):\s*([^}]+)\}$/i);
      if (keyDirective) {
        const currentKey = keyDirective[1].trim();
        const transposedKey = transposeChord(currentKey, semitones, preferFlats);
        return `{key: ${transposedKey}}`;
      }
      return line.replace(/\[([^\]]+)\]/g, (_, chord) => {
        return `[${transposeChord(chord, semitones, preferFlats)}]`;
      });
    })
    .join('\n');
}

export function parseChordPro(chordPro: string): ParsedChordPro {
  const meta: ChordProMeta = {};
  const lines: ParsedLine[] = [];

  const rawLines = chordPro.replace(/\r\n/g, '\n').split('\n');

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();

    if (trimmed === '') {
      lines.push({ type: 'empty' });
      continue;
    }

    // Directives: {title: ...}, {t: ...}, {artist: ...}, {key: ...}, {capo: ...}, {comment: ...}, {soc}, {eoc}
    const directiveMatch = trimmed.match(/^\{([^:}]+)(?::\s*(.*))?\}$/);
    if (directiveMatch) {
      const name = directiveMatch[1].trim().toLowerCase();
      const value = (directiveMatch[2] || '').trim();

      if (name === 'title' || name === 't') {
        meta.title = value;
      } else if (name === 'artist' || name === 'subtitle' || name === 'st') {
        meta.artist = value;
      } else if (name === 'key' || name === 'k') {
        meta.key = value;
      } else if (name === 'capo') {
        const parsed = parseInt(value, 10);
        if (!Number.isNaN(parsed)) meta.capo = parsed;
      } else if (name === 'comment' || name === 'c') {
        lines.push({ type: 'comment', text: value });
      } else if (name === 'soc' || name === 'start_of_chorus') {
        lines.push({ type: 'section', text: value || 'Refrão' });
      } else if (name === 'sov' || name === 'start_of_verse') {
        lines.push({ type: 'section', text: value || 'Estrofe' });
      }
      // Ignore closing directives like {eoc}, {eov} or unknown metadata
      continue;
    }

    // Parse chord + lyric segments on the line
    const segments: ChordSegment[] = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let pendingChord: string | undefined = undefined;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(rawLine)) !== null) {
      const textBefore = rawLine.slice(lastIndex, match.index);
      if (textBefore.length > 0 || pendingChord) {
        segments.push({ chord: pendingChord, text: textBefore });
      }
      pendingChord = match[1].trim();
      lastIndex = regex.lastIndex;
    }

    const remainingText = rawLine.slice(lastIndex);
    if (remainingText.length > 0 || pendingChord) {
      segments.push({ chord: pendingChord, text: remainingText });
    }

    lines.push({ type: 'lyric', segments });
  }

  return { meta, lines };
}

const CHORD_TOKEN_REGEX =
  /^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M)?[0-9]*(?:\([^)]+\))?(?:\/[A-G][#b]?)?$/;

export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0) return false;
  let chordCount = 0;
  for (const token of tokens) {
    const cleaned = token.replace(/[()[\],|]/g, '');
    if (cleaned && CHORD_TOKEN_REGEX.test(cleaned)) {
      chordCount++;
    }
  }
  return chordCount > 0 && chordCount / tokens.length >= 0.65;
}

export function detectKeyFromChordPro(chordPro: string): string {
  const keyMatch = chordPro.match(/\{(?:key|k):\s*([^}]+)\}/i);
  if (keyMatch) return keyMatch[1].trim();
  const firstChord = chordPro.match(/\[([A-G][#b]?m?)\]/);
  return firstChord ? firstChord[1] : 'C';
}

export function textWithChordsAboveToChordPro(
  rawText: string,
  options?: { title?: string; artist?: string; key?: string }
): string {
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const output: string[] = [];

  if (options?.title) output.push(`{title: ${options.title}}`);
  if (options?.artist) output.push(`{artist: ${options.artist}}`);
  if (options?.key) output.push(`{key: ${options.key}}`);
  if (output.length > 0) output.push('');

  let i = 0;
  while (i < lines.length) {
    const current = lines[i];

    // Already ChordPro? Keep as is
    if (/\[[A-G][#b]?[^\]]*\]/.test(current) || /^\{[^}]+\}$/.test(current.trim())) {
      output.push(current);
      i++;
      continue;
    }

    if (isChordLine(current)) {
      const next = i + 1 < lines.length ? lines[i + 1] : '';
      // Extract chord positions
      const chordMatches: { chord: string; index: number }[] = [];
      const tokenRegex = /\S+/g;
      let m: RegExpExecArray | null;
      while ((m = tokenRegex.exec(current)) !== null) {
        chordMatches.push({ chord: m[0], index: m.index });
      }

      if (next && !isChordLine(next) && next.trim() !== '') {
        // Merge chords into the lyric line below
        let merged = '';
        let lyricCursor = 0;
        const paddedNext =
          next.length < current.length ? next.padEnd(current.length, ' ') : next;

        for (const cm of chordMatches) {
          if (cm.index > lyricCursor) {
            merged += paddedNext.slice(lyricCursor, cm.index);
            lyricCursor = cm.index;
          }
          merged += `[${cm.chord}]`;
        }
        merged += paddedNext.slice(lyricCursor);
        output.push(merged.trimEnd());
        i += 2;
        continue;
      } else {
        // Standalone chord line (e.g., Intro)
        const inline = chordMatches.map((c) => `[${c.chord}]`).join(' ');
        output.push(inline);
        i++;
        continue;
      }
    }

    // Section markers like "Refrão:" or "[Refrão]"
    const trimmed = current.trim();
    if (/^(?:\[?(?:refrão|estrofe|intro|solo|ponte|final)\]?:?)$/i.test(trimmed)) {
      output.push(`{comment: ${trimmed.replace(/[\[\]:]/g, '')}}`);
    } else {
      output.push(current);
    }
    i++;
  }

  return output.join('\n').trim();
}
