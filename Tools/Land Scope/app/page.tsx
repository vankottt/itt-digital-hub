import { getChatGPTUser } from './chatgpt-auth'
import { isAdminUserId } from '../src/server/config'
import { AnalyzerEntry } from './AnalyzerEntry'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getChatGPTUser()
  return <AnalyzerEntry ownerMode={isAdminUserId(user?.userId)} />
}
