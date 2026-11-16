import { getLaravelApiBase } from '../../utils/api-base'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const apiBase = getLaravelApiBase()

  try {
    return await $fetch(`${apiBase}/register/set-password`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: {
        email: body.email,
        token: body.token,
        password: body.password,
        password_confirmation: body.password_confirmation
      }
    })
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      statusMessage: error.data?.message || 'Pengaturan password gagal.'
    })
  }
})
