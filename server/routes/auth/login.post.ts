import { getLaravelApiBase } from '../../utils/api-base'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const apiBase = getLaravelApiBase()

  try {
    const result: any = await $fetch(`${apiBase}/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: {
        email: body.email,
        password: body.password,
        device_name: 'RAHANPAS Server Manager Web'
      }
    })

    const forwardedProto = getRequestHeader(event, 'x-forwarded-proto')
    const isHttps = forwardedProto === 'https'

    setCookie(event, 'rahanpas_session', result.token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8
    })

    return {
      message: result.message,
      user: result.user
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      statusMessage:
        error.data?.message ||
        error.statusMessage ||
        'Login gagal. Periksa koneksi server.'
    })
  }
})
