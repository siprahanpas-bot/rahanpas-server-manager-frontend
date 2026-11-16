import { laravelApi } from '../../../../../utils/laravel-api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid server ID.'
    })
  }

  const body = await readBody(event)

  return await laravelApi(
    event,
    `/servers/${id}/storage-devices/format`,
    {
      method: 'POST',
      body
    }
  )
})
