import { getLaravelApiBase } from '../../utils/api-base'
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'rahanpas_session')

  const apiBase = getLaravelApiBase()

  try {
    if (token) {
      await $fetch(`${apiBase}/logout`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
    }
  } finally {
    deleteCookie(event, 'rahanpas_session', {
      path: '/'
    })
  }

  return {
    message: 'Logout berhasil.'
  }
})
