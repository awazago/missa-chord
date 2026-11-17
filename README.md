# MissaChord — Acervo Litúrgico em ChordPro (PWA)

Aplicação web progressiva (PWA) para músicos e ministérios de música católicos gerenciarem cifras em padrão **ChordPro**, transporem tons instantaneamente, importarem músicas a partir de URLs e gerarem setlists completos baseados na liturgia do dia.

## Funcionalidades

- **Acervo em ChordPro**: parser e transposição cromática em tempo real (`-1 / +1` semitom), salvando o tom preferido por música.
- **Importação via URL (`/api/import-url`)**: extrai cifras de páginas web e converte para ChordPro automaticamente, com fallback para colar texto com acordes acima da letra.
- **Categorização Múltipla**: uma mesma música pode pertencer a vários momentos da missa (*Entrada*, *Comunhão*, *Final*, etc.) e tempos litúrgicos.
- **Classificação por Estrelas (1–5★)**: ordenação e priorização automática nas sugestões de setlist.
- **Gerador de Setlist Litúrgico**: gera roteiros (ex.: `missa_terceiro_domingo_tempo_comum`), omitindo o *Glória* na Quaresma/Advento e abrindo o **Modo Missa** para tocar música a música.
- **PWA Offline-First + Modo Palco**: instalável em celulares/tablets, Service Worker para uso sem sinal na igreja, modo escuro de alto contraste e *Screen Wake Lock* (tela sempre acesa).

## Rodando Localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Sem variáveis de ambiente configuradas, o app funciona em **Modo Offline Local** (`localStorage`) com um acervo inicial pré-carregado.

## Deploy Gratuito (Vercel Hobby + Domínio Próprio + Supabase Free)

1. **Banco e Autenticação (Supabase Free)**:
   - Crie um projeto gratuito em [supabase.com](https://supabase.com).
   - No **SQL Editor**, execute o conteúdo de `supabase/schema.sql`.
   - Em **Authentication → Providers**, ative **Email** e **Google** (informando Client ID e Secret do Google Cloud Console).
2. **Hospedagem e Domínio Próprio (Vercel Hobby)**:
   - Suba este repositório para o GitHub e importe na [vercel.com](https://vercel.com).
   - Em **Settings → Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (veja `.env.example`).
   - Em **Settings → Domains**, adicione seu domínio próprio (SSL automático e gratuito).
3. **Quando escalar / monetizar**:
   - Ao ativar cobrança dos planos Premium (ex.: Stripe / Mercado Pago), faça o upgrade da Vercel para o plano **Pro** (exigência de licença comercial da Vercel) e do Supabase conforme o volume de usuários.
