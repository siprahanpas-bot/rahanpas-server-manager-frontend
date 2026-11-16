import { fileManagerProxy } from '../../../../utils/file-manager-proxy'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid server ID.'
    })
  }

  return await fileManagerProxy(event, `/servers/${id}/storage-devices`)
})
