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
import { summarizeCredentialValue } from '@/utilities/debug'
import Browser, { type Storage } from 'webextension-polyfill'
import Expiry from '@/components/Expiry'

const PLATFORM_NAMES = ['macOS and Linux', 'Windows', 'PowerShell'] as const
const DEFAULT_PLATFORM = PLATFORM_NAMES[0]
const LOG_PREFIX = '[AWS SAML to STS][popup]'

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

  useEffect((): (() => void) => {
    const updateCredentials = (
      storedCredentials: unknown,
      source: string,
    ): void => {
      const summary = summarizeCredentialValue(storedCredentials)

      if (typeof storedCredentials === 'undefined') {
        console.log(`${LOG_PREFIX} No stored credentials available.`, {
          source,
          ...summary,
        })
        setCredentials(defaultCredentials)
        setReady(false)
        return
      }

      if (!isAWSCredentials(storedCredentials)) {
        console.error(
          `${LOG_PREFIX} Invalid credentials found in local storage.`,
          {
            source,
            ...summary,
          },
        )
        setCredentials(defaultCredentials)
        setReady(false)
        return
      }

      const nextReady = storedCredentials._expiry >= Date.now()
      console.log(`${LOG_PREFIX} Loaded stored credentials.`, {
        source,
        ready: nextReady,
        ...summary,
      })

      setCredentials(storedCredentials)
      setReady(nextReady)
    }

    const updatePlatform = (storedPlatform: unknown, source: string): void => {
      if (typeof storedPlatform === 'undefined') {
        console.log(`${LOG_PREFIX} No stored platform preference found.`, {
          fallback: DEFAULT_PLATFORM,
          source,
        })
        return
      }

      if (!isPlatformName(storedPlatform)) {
        console.error(
          `${LOG_PREFIX} Invalid platform found in local storage.`,
          {
            source,
            value: storedPlatform,
          },
        )
        return
      }

      console.log(`${LOG_PREFIX} Loaded platform preference.`, {
        platform: storedPlatform,
        source,
      })
      setActiveTab(storedPlatform)
    }

    const handleStorageChange = (
      changes: Storage.StorageAreaOnChangedChangesType,
    ): void => {
      if ('credentials' in changes) {
        updateCredentials(changes.credentials?.newValue, 'storage.onChanged')
      }

      if ('platform' in changes) {
        updatePlatform(changes.platform?.newValue, 'storage.onChanged')
      }
    }

    console.log(`${LOG_PREFIX} Opening popup and loading stored state.`)

    void Browser.storage.local.get('credentials').then((current): void => {
      updateCredentials(current.credentials, 'initial load')
    })

    void Browser.storage.local.get('platform').then((current): void => {
      updatePlatform(current.platform, 'initial load')
    })

    Browser.storage.local.onChanged.addListener(handleStorageChange)
    console.log(`${LOG_PREFIX} Registered storage change listener.`)

    return (): void => {
      Browser.storage.local.onChanged.removeListener(handleStorageChange)
      console.log(`${LOG_PREFIX} Removed storage change listener.`)
    }
  }, [])

  const handleTabChange = (platform: PlatformName): void => {
    void Browser.storage.local.set({ platform }).then((): void => {
      console.log(`${LOG_PREFIX} Updated platform preference.`, { platform })
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
