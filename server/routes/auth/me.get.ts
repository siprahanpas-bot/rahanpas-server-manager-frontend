import { getLaravelApiBase } from '../../utils/api-base'
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'rahanpas_session')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthenticated.'
    })
  }

  const apiBase = getLaravelApiBase()

  try {
    const result: any = await $fetch(`${apiBase}/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    return result.user
  } catch (error: any) {
    if ((error.statusCode || error.response?.status) === 401) {
      deleteCookie(event, 'rahanpas_session', {
        path: '/'
      })
    }

    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      statusMessage: error.data?.message || 'Gagal memeriksa sesi pengguna.'
    })
  }
})
