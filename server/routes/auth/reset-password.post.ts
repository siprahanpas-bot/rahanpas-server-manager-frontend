import { getLaravelApiBase } from '../../utils/api-base'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const apiBase = getLaravelApiBase()

  try {
    const result: any = await $fetch(`${apiBase}/reset-password`, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: {
        token: body?.token,
        email: body?.email,
        password: body?.password,
        password_confirmation: body?.password_confirmation
      }
    })

    return result
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      statusMessage:
        error.data?.message ||
        error.statusMessage ||
        'Gagal mereset password.'
    })
  }
})
