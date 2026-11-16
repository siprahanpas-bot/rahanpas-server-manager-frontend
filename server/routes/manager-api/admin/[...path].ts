import { laravelApi } from '~/server/utils/laravel-api'

export default defineEventHandler(async (event) => {
  const path = event.context.params?.path || ''
  const query = getQuery(event)
  const method = event.method
  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    ? await readBody(event).catch(() => undefined)
    : undefined

  return await laravelApi(event, `/admin/${path}`, {
    method,
    query,
    body,
  })
})
