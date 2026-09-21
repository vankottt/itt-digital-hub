import { sites } from '@openai/sites-vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import vinext from 'vinext'
import hostingConfig from './.openai/hosting.json' with { type: 'json' }

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID = '00000000-0000-4000-8000-000000000000'

export default defineConfig(async ({ mode }) => {
  if (mode === 'test') {
    return { plugins: [react()] }
  }

  process.env.WRANGLER_WRITE_LOGS ??= 'false'
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs'
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry'

  const { cloudflare } = await import('@cloudflare/vite-plugin')

  return {
    server: { port: 5173, host: '127.0.0.1' },
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: {
          main: './worker/index.ts',
          compatibility_flags: ['nodejs_compat'],
          vars: {
            ...(process.env.ADMIN_USER_IDS ? { ADMIN_USER_IDS: process.env.ADMIN_USER_IDS } : {}),
            ...(process.env.DATA_CONTROLLER_NAME ? { DATA_CONTROLLER_NAME: process.env.DATA_CONTROLLER_NAME } : {}),
            ...(process.env.PRIVACY_CONTACT_EMAIL ? { PRIVACY_CONTACT_EMAIL: process.env.PRIVACY_CONTACT_EMAIL } : {}),
            ...(process.env.DATA_RETENTION_MONTHS ? { DATA_RETENTION_MONTHS: process.env.DATA_RETENTION_MONTHS } : {}),
          },
          d1_databases: hostingConfig.d1
            ? [{
                binding: hostingConfig.d1,
                database_name: 'site-creator-d1',
                database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
              }]
            : [],
        },
      }),
    ],
  }
})
