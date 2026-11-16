import { laravelApi } from '../../../../../utils/laravel-api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid server ID.',
    })
  }

  const query = getQuery(event)
  const period = String(query.period || '1h')

  if (!['1h', '6h', '24h', '7d'].includes(period)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid monitoring history period.',
    })
  }

  return await laravelApi(
    event,
    `/servers/${id}/monitoring/history?period=${period}`,
    { method: 'GET' },
  )
})
