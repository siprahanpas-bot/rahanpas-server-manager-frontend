import { getLaravelApiBase } from '../../utils/api-base'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const apiBase = getLaravelApiBase()

  try {
    const result: any = await $fetch(`${apiBase}/forgot-password`, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: {
        email: body?.email
      }
    })

    return result
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      statusMessage:
        error.data?.message ||
        error.statusMessage ||
        'Gagal mengirim tautan reset password.'
    })
  }
})
