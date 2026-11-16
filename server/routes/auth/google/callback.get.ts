import { getLaravelApiBase } from '../../../utils/api-base'
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = String(query.code || '')

  if (!code) {
    return sendRedirect(event, '/register?error=' + encodeURIComponent('Otorisasi Google dibatalkan atau gagal.'))
  }

  const apiBase = getLaravelApiBase()
  const host = getRequestHeader(event, 'x-forwarded-host') || getRequestHeader(event, 'host') || 'localhost:3000'
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'http'
  const redirectUri = `${proto}://${host}/auth/google/callback`
  const isHttps = proto === 'https'

  try {
    const result: any = await $fetch(`${apiBase}/auth/google/exchange`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: { code, redirect_uri: redirectUri },
    })

    setCookie(event, 'rahanpas_session', result.token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    })

    return sendRedirect(event, '/dashboard')
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Gagal login dengan Google.'
    return sendRedirect(event, '/register?error=' + encodeURIComponent(msg))
  }
})
