import { laravelApi } from '../../../../utils/laravel-api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid server ID.'
    })
  }

  const body = await readBody(event).catch(() => ({}))

  return await laravelApi(
    event,
    `/servers/${id}/rdp-token`,
    { method: 'POST', body }
  )
})
