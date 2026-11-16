import { laravelApi } from '../../../utils/laravel-api'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  return await laravelApi(event, '/servers', {
    method: 'POST',
    body
  })
})
