import React, { useEffect, useState } from 'react'
import CodeSnippet from '@/components/CodeSnippet'
import {
  type AWSCredentials,
  defaultCredentials,
  iniSnippet,
  isAWSCredentials,
  powershellSnippet,
  unixSnippet,
  windowsSnippet,
} from '@/utilities'
import Browser from 'webextension-polyfill'
import Expiry from '@/components/Expiry'

const PLATFORM_NAMES = ['macOS and Linux', 'Windows', 'PowerShell'] as const
const DEFAULT_PLATFORM = PLATFORM_NAMES[0]

type PlatformName = (typeof PLATFORM_NAMES)[number]

type Platform = {
  current: boolean
  name: PlatformName
}

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

const buildPlatforms = (activePlatform: PlatformName): Platform[] =>
  PLATFORM_NAMES.map((name) => ({
    current: name === activePlatform,
    name,
  }))

const isPlatformName = (value: unknown): value is PlatformName =>
  typeof value === 'string' &&
  PLATFORM_NAMES.some((platform) => platform === value)

const Popup = (): React.ReactElement => {
  const [ready, setReady] = useState<boolean>(false)
  const [credentials, setCredentials] =
    useState<AWSCredentials>(defaultCredentials)
  const [activeTab, setActiveTab] = useState<PlatformName>(DEFAULT_PLATFORM)
  const platforms = buildPlatforms(activeTab)

  useEffect((): void => {
    void Browser.storage.local.get('credentials').then((current): void => {
      const storedCredentials = current.credentials

      if (typeof storedCredentials === 'undefined') {
        return
      }

      if (!isAWSCredentials(storedCredentials)) {
        console.error('Invalid credentials found in local storage')
        return
      }

      setCredentials(storedCredentials)
      setReady(storedCredentials._expiry >= Date.now())
    })

    void Browser.storage.local.get('platform').then((current): void => {
      const storedPlatform = current.platform

      if (typeof storedPlatform === 'undefined') {
        return
      }

      if (!isPlatformName(storedPlatform)) {
        console.error('Invalid platform found in local storage')
        return
      }

      setActiveTab(storedPlatform)
    })
  }, [])

  const handleTabChange = (platform: PlatformName): void => {
    void Browser.storage.local.set({ platform }).then((): void => {
      setActiveTab(platform)
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
