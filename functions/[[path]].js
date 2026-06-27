export const onRequest = async (context) => {
    const { request, next } = context
  
    // Country from Cloudflare
    const country = request.cf?.country ?? 'ZZ'
  
    // Get the normal response (your built Vite app)
    const response = await next()
  
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) {
        // Don't touch non-HTML (JS, CSS, assets)
        return response
    }
  
    const html = await response.text()
  
    // Inject window.__COUNTRY__ into <head>
    const patched = html.replace(
        '</head>',
        `<script>window.__COUNTRY__=${JSON.stringify(country)};</script></head>`
    )
  
    return new Response(patched, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    })
}