import React, { useEffect, useState } from 'react'
import CodeSnippet from '@/components/CodeSnippet'
import {
  type Credentials,
  iniCredentials,
  powershellCredentials,
  unixCredentials,
  windowsCredentials,
} from '@/utilities'

type Platform = {
  current: boolean
  name: string
}

const credentials: Credentials = {
  AWS_ACCESS_KEY_ID: 'ASIA1234567890123456',
  AWS_SECRET_ACCESS_KEY: '1234567890123456789012345678901234567890',
  AWS_SESSION_TOKEN: '1234567890abcdefghijklmnopqrstuvwxyz1234567890',
}

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

const Popup = (): React.ReactElement => {
  const [platforms, setPlatforms] = useState([
    { name: 'macOS and Linux', current: true },
    { name: 'Windows', current: false },
    { name: 'Powershell', current: false },
  ])

  const [activeTab, setActiveTab] = useState(
    platforms.find((p) => p.current)!.name,
  )

  useEffect((): void => {
    const platform = localStorage.getItem('platform')
    if (platform) {
      handleTabChange(platform)
    }
  }, [])

  const handleTabChange = (platform: string): void => {
    localStorage.setItem('platform', platform)
    setActiveTab(platform)
    setPlatforms(
      platforms.map(
        (p): Platform => ({
          ...p,
          current: p.name === platform,
        }),
      ),
    )
  }

  return (
    <div id={`popup`} className={`bg-gray-100 p-2`}>
      <nav className={`mb-2 flex space-x-4`}>
        {platforms.map((platform) => (
          <a
            className={classNames(
              platform.current
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700',
              'rounded-md px-3 py-2 text-sm font-medium',
            )}
            href={`#`}
            key={platform.name}
            onClick={(): void => handleTabChange(platform.name)}>
            {platform.name}
          </a>
        ))}
      </nav>
      <div>
        {activeTab === 'macOS and Linux' && (
          <CodeSnippet code={unixCredentials(credentials)} />
        )}
        {activeTab === 'Windows' && (
          <CodeSnippet code={windowsCredentials(credentials)} />
        )}
        {activeTab === 'Powershell' && (
          <CodeSnippet code={powershellCredentials(credentials)} />
        )}
      </div>
      <div>
        <CodeSnippet code={iniCredentials(credentials)} />
      </div>
    </div>
  )
}

export default Popup
