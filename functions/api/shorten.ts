interface Env { SHORT_URLS: KVNamespace }

const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'

function code() {
  const bytes = crypto.getRandomValues(new Uint8Array(7))
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('')
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SHORT_URLS) return Response.json({ error: 'Servis pemendek belum dikonfigurasi. Tambah KV binding bernama SHORT_URLS di Cloudflare Pages.' }, { status: 503 })
  let input: unknown
  try { input = await request.json() } catch { return Response.json({ error: 'Permintaan tidak sah.' }, { status: 400 }) }
  const value = typeof input === 'object' && input !== null && 'url' in input ? (input as { url?: unknown }).url : undefined
  if (typeof value !== 'string') return Response.json({ error: 'URL diperlukan.' }, { status: 400 })

  let url: URL
  try {
    url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error()
  } catch { return Response.json({ error: 'Masukkan URL http atau https yang sah.' }, { status: 400 }) }

  for (let attempt = 0; attempt < 4; attempt++) {
    const shortCode = code()
    const key = `url:${shortCode}`
    if (await env.SHORT_URLS.get(key)) continue
    await env.SHORT_URLS.put(key, url.toString())
    return Response.json({ shortUrl: `${new URL(request.url).origin}/s/${shortCode}` })
  }
  return Response.json({ error: 'Sila cuba lagi.' }, { status: 503 })
}
