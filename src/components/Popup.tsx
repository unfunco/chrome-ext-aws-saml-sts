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
import Expiry from '@/components/Expiry'

type Platform = {
  current: boolean
  name: string
}

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

const Popup = (): React.ReactElement => {
  const [ready, setReady] = useState<boolean>(false)

  const [credentials, setCredentials] = useState<AWSCredentials>({
    AWS_ACCESS_KEY_ID: '',
    AWS_SECRET_ACCESS_KEY: '',
    AWS_SESSION_TOKEN: '',
    _expiry: 0,
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
      setReady(current.credentials?._expiry >= Date.now())
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

  return (
    <div id={`popup`} className={`bg-gray-100 p-2 dark:bg-gray-900`}>
      <nav className={`mb-2 flex space-x-4`}>
        {platforms.map((platform) => (
          <a
            className={classNames(
              platform.current
                ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200',
              'rounded-md px-3 py-2 text-sm font-medium',
            )}
            href={`#`}
            key={platform.name}
            onClick={(): void => handleTabChange(platform.name)}>
            {platform.name}
          </a>
        ))}
      </nav>
      <div className={`text-xs text-gray-700 dark:text-gray-300`}>
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
      <div className={`text-xs text-gray-700 dark:text-gray-300`}>
        <p className={`mb-2 p-1`}>
          <strong>Option 2: </strong>
          Paste the following text into your AWS credentials file.
        </p>
        <CodeSnippet code={iniSnippet(credentials)} ready={ready} />
      </div>
      {ready && (
        <div className={`text-xs text-gray-700 dark:text-gray-300`}>
          <Expiry time={credentials._expiry} />
        </div>
      )}
    </div>
  )
}

export default Popup
