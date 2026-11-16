import { getLaravelApiBase } from './api-base'
import { proxyRequest } from 'h3'

export async function fileManagerProxy(
  event: any,
  path: string,
  options: { streamRequest?: boolean } = {}
) {
  const token = getCookie(event, 'rahanpas_session')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthenticated.'
    })
  }

  const apiBase = getLaravelApiBase()

  const target = `${apiBase}${path}${getRequestURL(event).search}`

  return await proxyRequest(event, target, {
    streamRequest: options.streamRequest ?? false,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      cookie: ''
    }
  })
}
