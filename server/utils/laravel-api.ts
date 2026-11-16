import { getLaravelApiBase } from './api-base'
export async function laravelApi(
  event: any,
  path: string,
  options: any = {}
) {
  const token = getCookie(event, 'rahanpas_session')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthenticated.'
    })
  }

  const apiBase = getLaravelApiBase()

  try {
    return await $fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    })
  } catch (error: any) {
    const statusCode =
      error.statusCode ||
      error.response?.status ||
      500

    throw createError({
      statusCode,
      statusMessage:
        error.data?.message ||
        error.statusMessage ||
        'Laravel API request failed.',
      data: error.data
    })
  }
}
