import { getLaravelApiBase } from '../../utils/api-base'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const apiBase = getLaravelApiBase()

  try {
    return await $fetch(`${apiBase}/register`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: {
        name: body.name,
        phone: body.phone,
        email: body.email
      }
    })
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || error.response?.status || 500,
      statusMessage: error.data?.message || 'Registrasi gagal. Silakan coba kembali.'
    })
  }
})
