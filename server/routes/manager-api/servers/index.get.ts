import { laravelApi } from '../../../utils/laravel-api'

export default defineEventHandler(async (event) => {
  return await laravelApi(event, '/servers', {
    query: getQuery(event)
  })
})
