import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import {
  detectKeyFromChordPro,
  isChordLine,
  textWithChordsAboveToChordPro,
} from '@/lib/chordpro';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';

    if (!rawUrl) {
      return NextResponse.json({ error: 'Informe uma URL válida.' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'URL inválida. Use o formato https://...' },
        { status: 400 }
      );
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `O site retornou status ${response.status}. Alguns portais bloqueiam extração automática — copie a cifra no site e use a aba "Colar Texto".`,
        },
        { status: 422 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title and artist from common meta tags / headings
    const ogTitle =
      $('meta[property="og:title"]').attr('content') ||
      $('h1').first().text() ||
      $('title').text() ||
      'Música Importada';

    const cleanedTitle = ogTitle
      .replace(/\s*[-|–]\s*(Cifra Club|Letras\.mus\.br|Cifras).*$/i, '')
      .trim();

    let title = cleanedTitle;
    let artist = '';
    if (cleanedTitle.includes(' - ')) {
      const parts = cleanedTitle.split(' - ');
      title = parts[0].trim();
      artist = parts.slice(1).join(' - ').trim();
    } else {
      const artistEl = $('h2 a, .t3, [itemprop="byArtist"]').first().text().trim();
      if (artistEl) artist = artistEl;
    }

    // Try to locate the chord sheet container
    const selectors = [
      'pre',
      '.cifra_cnt pre',
      '.cifra-content',
      '.cifra',
      '[class*="cifra"]',
      'article',
      'main',
    ];

    let rawChordText = '';
    for (const sel of selectors) {
      const el = $(sel).first();
      if (el.length > 0) {
        // Replace <br> with newlines before reading text
        el.find('br').replaceWith('\n');
        const text = el.text();
        const lines = text.split('\n');
        const hasChords = lines.some((l) => isChordLine(l));
        if (hasChords || sel === 'pre') {
          rawChordText = text;
          break;
        }
      }
    }

    if (!rawChordText.trim()) {
      return NextResponse.json(
        {
          error:
            'Não foi possível detectar uma cifra estruturada nesta página. Copie o texto da cifra e cole na aba "Colar Texto".',
        },
        { status: 422 }
      );
    }

    // Detect key if present
    const keyText =
      $('#cifra_tom a, [class*="tom"] a, [class*="key"]').first().text().trim() || '';

    const chordPro = textWithChordsAboveToChordPro(rawChordText, {
      title,
      artist: artist || undefined,
      key: keyText || undefined,
    });

    const detectedKey = keyText || detectKeyFromChordPro(chordPro);

    return NextResponse.json({
      title,
      artist,
      key: detectedKey,
      chordPro,
      sourceUrl: parsedUrl.toString(),
    });
  } catch (err) {
    const message =
      err instanceof Error && err.name === 'TimeoutError'
        ? 'Tempo esgotado ao acessar a URL. Tente colar o texto da cifra manualmente.'
        : 'Erro ao processar a URL. Verifique o endereço ou cole o texto da cifra manualmente.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
