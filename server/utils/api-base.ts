const DEFAULT_API_BASE = 'http://rahanpas-nginx/api'

export function getLaravelApiBase(): string {
  const configuredBase = process.env.NUXT_API_INTERNAL_BASE?.trim()

  return (configuredBase || DEFAULT_API_BASE).replace(/\/+$/, '')
}
