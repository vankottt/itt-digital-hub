import { notFound } from 'next/navigation'
import { requireChatGPTUser } from '../chatgpt-auth'
import { AdminDashboard } from './AdminDashboard'
import { getAdminData } from '../../src/server/admin-data'
import { isAdminUserId, privacyConfig } from '../../src/server/config'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await requireChatGPTUser('/admin')
  if (!isAdminUserId(user.userId)) notFound()
  try {
    const data = await getAdminData()
    return <AdminDashboard {...data} adminName={user.displayName} privacyReady={Boolean(privacyConfig().dataControllerName && privacyConfig().privacyContactEmail)} />
  } catch {
    return <main className="admin-page"><div className="page-topbar"><a href="/">← Анализатор</a><strong>Администрация</strong></div><section className="admin-error"><h1>Данните временно не могат да бъдат заредени</h1><p>Базата данни не отговори. Опитайте отново след малко.</p><a className="button button--primary" href="/admin">Опитай отново</a></section></main>
  }
}
