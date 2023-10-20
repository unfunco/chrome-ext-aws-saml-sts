import React, { useEffect, useState } from 'react'
import CodeSnippet from '@/components/CodeSnippet'
import {
  type AWSCredentials,
  iniSnippet,
  powershellSnippet,
  unixSnippet,
  windowsSnippet,
} from '@/utilities'

type Platform = {
  current: boolean
  name: string
}

const credentials: AWSCredentials = {
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
    { name: 'PowerShell', current: false },
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
      <div className={`text-xs`}>
        {activeTab === 'macOS and Linux' && (
          <>
            <p className={`mb-2 p-1`}>
              <strong>Option 1: </strong>
              Run the following commands in your terminal.
            </p>
            <CodeSnippet code={unixSnippet(credentials)} />
          </>
        )}
        {activeTab === 'Windows' && (
          <>
            <p className={`mb-2 p-1`}>
              <strong>Option 1: </strong>
              Run the following commands in your terminal.
            </p>
            <CodeSnippet code={windowsSnippet(credentials)} />
          </>
        )}
        {activeTab === 'PowerShell' && (
          <>
            <p className={`mb-2 p-1`}>
              <strong>Option 1: </strong>
              Paste the following text into PowerShell.
            </p>
            <CodeSnippet code={powershellSnippet(credentials)} />
          </>
        )}
      </div>
      <div className={`text-xs`}>
        <p className={`mb-2 p-1`}>
          <strong>Option 2: </strong>
          Paste the following text into your AWS credentials file.
        </p>
        <CodeSnippet code={iniSnippet(credentials)} />
      </div>
    </div>
  )
}

export default Popup
