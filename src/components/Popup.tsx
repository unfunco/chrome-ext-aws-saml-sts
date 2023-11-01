import React, { useEffect, useState } from 'react'
import CodeSnippet from '@/components/CodeSnippet'
import {
  type AWSCredentials,
  iniSnippet,
  powershellSnippet,
  unixSnippet,
  windowsSnippet,
} from '@/utilities'
import Browser from 'webextension-polyfill'

type Platform = {
  current: boolean
  name: string
}

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

const Popup = (): React.ReactElement => {
  const [credentials, setCredentials] = useState<AWSCredentials>({
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
    AWS_SESSION_TOKEN: '',
  })

  const [platforms, setPlatforms] = useState<Platform[]>([
    { name: 'macOS and Linux', current: true },
    { name: 'Windows', current: false },
    { name: 'PowerShell', current: false },
  ])

  const [activeTab, setActiveTab] = useState<string>(
    platforms.find((p) => p.current)?.name ?? 'macOS and Linux',
  )

  useEffect((): void => {
    Browser.storage.local.get('credentials').then((current): void => {
      setCredentials(current.credentials)
    })

    Browser.storage.local.get('platform').then((current): void => {
      handleTabChange(current.platform)
    })
  }, [])

  const handleTabChange = (platform: string): void => {
    Browser.storage.local.set({ platform }).then((): void => {
      setActiveTab(platform)
      setPlatforms(
        platforms.map(
          (p): Platform => ({
            ...p,
            current: p.name === platform,
          }),
        ),
      )
    })
  }

  const ready = typeof credentials?.AWS_ACCESS_KEY_ID !== 'undefined'

  return (
    <div id={`popup`} className={`bg-gray-100 p-2`}>
      <nav className={`mb-2 flex space-x-4`}>
        {platforms.map((platform) => (
          <a
            className={classNames(
              platform.current
                ? 'bg-gray-200 text-gray-900'
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
            <CodeSnippet code={unixSnippet(credentials)} ready={ready} />
          </>
        )}
        {activeTab === 'Windows' && (
          <>
            <p className={`mb-2 p-1`}>
              <strong>Option 1: </strong>
              Run the following commands in your terminal.
            </p>
            <CodeSnippet code={windowsSnippet(credentials)} ready={ready} />
          </>
        )}
        {activeTab === 'PowerShell' && (
          <>
            <p className={`mb-2 p-1`}>
              <strong>Option 1: </strong>
              Paste the following text into PowerShell.
            </p>
            <CodeSnippet code={powershellSnippet(credentials)} ready={ready} />
          </>
        )}
      </div>
      <div className={`text-xs`}>
        <p className={`mb-2 p-1`}>
          <strong>Option 2: </strong>
          Paste the following text into your AWS credentials file.
        </p>
        <CodeSnippet code={iniSnippet(credentials)} ready={ready} />
      </div>
    </div>
  )
}

export default Popup
