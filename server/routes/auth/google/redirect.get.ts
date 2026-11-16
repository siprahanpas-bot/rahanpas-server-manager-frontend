import { getLaravelApiBase } from '../../../utils/api-base'
export default defineEventHandler(async (event) => {
  const apiBase = getLaravelApiBase()
  const cfg: any = await $fetch(`${apiBase}/auth/google/config`, {
    headers: { Accept: 'application/json' }
  }).catch(() => ({ client_id: '', configured: false }))

  if (!cfg.configured || !cfg.client_id) {
    return sendRedirect(event, '/register?error=' + encodeURIComponent('Google OAuth belum dikonfigurasi di server (.env GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET).'))
  }

  const host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || 'localhost:3000'
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'http'
  const redirectUri = `${proto}://${host}/auth/google/callback`

  const params = new URLSearchParams({
    client_id: cfg.client_id,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
  })

  return sendRedirect(event, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
})
