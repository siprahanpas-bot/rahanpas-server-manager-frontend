import { getLaravelApiBase } from '../../utils/api-base'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const apiBase = getLaravelApiBase()

  try {
    return await $fetch(`${apiBase}/register/resend-verification`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: {
        email: body.email
      }
    })
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      statusMessage: error.data?.message || 'Gagal mengirim ulang email verifikasi.'
    })
  }
})
