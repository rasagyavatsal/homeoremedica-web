const g = globalThis as any

if (!g.Request || !g.Response || !g.Headers || !g.fetch) {
  try {
    const undici = require('undici')

    g.fetch = g.fetch || undici.fetch
    g.Request = g.Request || undici.Request
    g.Response = g.Response || undici.Response
    g.Headers = g.Headers || undici.Headers
  } catch {
  }
}
