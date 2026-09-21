'use client'

import dynamic from 'next/dynamic'

const ConferenceExperience = dynamic(() => import('../src/conference/ConferenceExperience'), { ssr: false })

export function AnalyzerEntry({ ownerMode }: { ownerMode: boolean }) {
  return <ConferenceExperience ownerMode={ownerMode} />
}
