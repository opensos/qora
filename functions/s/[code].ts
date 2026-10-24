interface Env { SHORT_URLS: KVNamespace }

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const code = typeof params.code === 'string' ? params.code : ''
  const destination = await env.SHORT_URLS.get(`url:${code}`)
  if (!destination) return new Response('Pautan tidak ditemui.', { status: 404 })
  return Response.redirect(destination, 302)
}
