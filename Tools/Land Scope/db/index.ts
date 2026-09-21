import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export function getDb() {
  if (!env.DB) throw new Error('Базата данни временно не е достъпна.')
  return drizzle(env.DB, { schema })
}

export function getD1() {
  if (!env.DB) throw new Error('Базата данни временно не е достъпна.')
  return env.DB
}
