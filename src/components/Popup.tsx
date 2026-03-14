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

const PLATFORM_OPTIONS = [
  {
    intro: 'Run in Terminal',
    label: 'macOS/Linux',
    snippet: unixSnippet,
    storageValue: 'macOS and Linux',
  },
  {
    intro: 'Run in Command Prompt',
    label: 'Windows CMD',
    snippet: windowsSnippet,
    storageValue: 'Windows',
  },
  {
    intro: 'Run in PowerShell',
    label: 'PowerShell',
    snippet: powershellSnippet,
    storageValue: 'PowerShell',
  },
] as const
const DEFAULT_PLATFORM = PLATFORM_OPTIONS[0].storageValue
const LOG_PREFIX = '[AWS SAML to STS][popup]'

type PlatformName = (typeof PLATFORM_OPTIONS)[number]['storageValue']

type Platform = (typeof PLATFORM_OPTIONS)[number] & {
  current: boolean
}

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}

const buildPlatforms = (activePlatform: PlatformName): Platform[] =>
  PLATFORM_OPTIONS.map((platform) => ({
    ...platform,
    current: platform.storageValue === activePlatform,
  }))

const isPlatformName = (value: unknown): value is PlatformName =>
  typeof value === 'string' &&
  PLATFORM_OPTIONS.some((platform) => platform.storageValue === value)

const Popup = (): React.ReactElement => {
  const [ready, setReady] = useState<boolean>(false)
  const [credentials, setCredentials] =
    useState<AWSCredentials>(defaultCredentials)
  const [activeTab, setActiveTab] = useState<PlatformName>(DEFAULT_PLATFORM)
  const platforms = buildPlatforms(activeTab)
  const activePlatform =
    PLATFORM_OPTIONS.find((platform) => platform.storageValue === activeTab) ??
    PLATFORM_OPTIONS[0]

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

    void Browser.storage.local
      .get('credentials')
      .then((current): void => {
        updateCredentials(current.credentials, 'initial load')
      })
      .catch((error: unknown): void => {
        console.error(`${LOG_PREFIX} Failed to load stored credentials.`, error)
      })

    void Browser.storage.local
      .get('platform')
      .then((current): void => {
        updatePlatform(current.platform, 'initial load')
      })
      .catch((error: unknown): void => {
        console.error(
          `${LOG_PREFIX} Failed to load platform preference.`,
          error,
        )
      })

    Browser.storage.local.onChanged.addListener(handleStorageChange)
    console.log(`${LOG_PREFIX} Registered storage change listener.`)

    return (): void => {
      Browser.storage.local.onChanged.removeListener(handleStorageChange)
      console.log(`${LOG_PREFIX} Removed storage change listener.`)
    }
  }, [])

  const handleTabChange = (platform: PlatformName): void => {
    void Browser.storage.local
      .set({ platform })
      .then((): void => {
        console.log(`${LOG_PREFIX} Updated platform preference.`, { platform })
        setActiveTab(platform)
      })
      .catch((error: unknown): void => {
        console.error(`${LOG_PREFIX} Failed to update platform preference.`, {
          error,
          platform,
        })
      })
  }

  return (
    <div id={`popup`} className={`popup`}>
      <nav aria-label={`Platform selection`} className={`popup__tabs`}>
        {platforms.map((platform) => (
          <button
            aria-pressed={platform.current}
            className={classNames(
              'popup__tab',
              platform.current ? 'popup__tab--active' : '',
            )}
            key={platform.storageValue}
            onClick={(): void => handleTabChange(platform.storageValue)}
            type={`button`}>
            {platform.label}
          </button>
        ))}
      </nav>
      <div className={`popup__section`}>
        <p className={`popup__intro`}>
          <span className={`popup__intro-label`}>Option 1:</span>
          <span>{activePlatform.intro}</span>
        </p>
        <CodeSnippet code={activePlatform.snippet(credentials)} ready={ready} />
      </div>
      <div className={`popup__section`}>
        <p className={`popup__intro`}>
          <span className={`popup__intro-label`}>Option 2:</span>
          <span>Add to AWS credentials file</span>
        </p>
        <CodeSnippet code={iniSnippet(credentials)} ready={ready} />
      </div>
      {ready && (
        <div className={`popup__expiry`}>
          <Expiry time={credentials._expiry} />
        </div>
      )}
    </div>
  )
}

export default Popup
