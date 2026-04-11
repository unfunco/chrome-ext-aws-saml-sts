/** @jest-environment jsdom */

import Popup from '@/components/Popup'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import Browser from 'webextension-polyfill'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

describe('Popup', (): void => {
  let container: HTMLDivElement | undefined
  let root: Root | undefined

  const mockGet = Browser.storage.local.get as jest.MockedFunction<
    typeof Browser.storage.local.get
  >
  const mockSet = Browser.storage.local.set as jest.MockedFunction<
    typeof Browser.storage.local.set
  >
  const mockAddStorageListener = Browser.storage.local.onChanged
    .addListener as jest.MockedFunction<
    typeof Browser.storage.local.onChanged.addListener
  >
  const mockRemoveStorageListener = Browser.storage.local.onChanged
    .removeListener as jest.MockedFunction<
    typeof Browser.storage.local.onChanged.removeListener
  >

  const renderComponent = async (): Promise<void> => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const nextRoot = createRoot(container)
    root = nextRoot

    await act(async (): Promise<void> => {
      nextRoot.render(<Popup />)
    })
  }

  const getRenderedElement = (): Element => {
    if (container?.firstElementChild == null) {
      throw new Error('Popup did not render')
    }

    return container.firstElementChild
  }

  beforeEach((): void => {
    jest.spyOn(console, 'error').mockImplementation((): void => undefined)
    jest.spyOn(console, 'log').mockImplementation((): void => undefined)
    mockGet.mockResolvedValue({})
    mockSet.mockResolvedValue(undefined)
  })

  afterEach(async (): Promise<void> => {
    jest.restoreAllMocks()
    jest.clearAllMocks()

    const currentRoot = root

    if (currentRoot != null) {
      await act(async (): Promise<void> => {
        currentRoot.unmount()
      })
    }

    container?.remove()
    container = undefined
    root = undefined
  })

  describe('platform', (): void => {
    it('is configured to display macOS/Linux by default', async (): Promise<void> => {
      await renderComponent()

      expect(mockGet).toHaveBeenCalledWith('credentials')
      expect(mockGet).toHaveBeenCalledWith('platform')
      expect(mockAddStorageListener).toHaveBeenCalledTimes(1)
      expect(mockSet).not.toHaveBeenCalled()
      expect(getRenderedElement().textContent).toContain('Option 1:')
      expect(getRenderedElement().textContent).toContain('macOS/Linux')
      expect(getRenderedElement().textContent).toContain('Run in Terminal')
      expect(getRenderedElement().textContent).toContain('Option 2:')
      expect(getRenderedElement().textContent).toContain(
        'Add to AWS credentials file',
      )
      expect(getRenderedElement()).toMatchSnapshot()
    })

    it('restores the saved platform selection', async (): Promise<void> => {
      mockGet.mockImplementation(
        async (keys): Promise<Record<string, unknown>> =>
          keys === 'platform' ? { platform: 'PowerShell' } : {},
      )

      await renderComponent()

      expect(container?.querySelector('.popup__tab--active')?.textContent).toBe(
        'PowerShell',
      )
      expect(getRenderedElement().textContent).toContain('Run in PowerShell')
    })

    it('updates when credentials change while the popup is open', async (): Promise<void> => {
      await renderComponent()

      const handleStorageChange = mockAddStorageListener.mock
        .calls[0]?.[0] as Parameters<
        typeof Browser.storage.local.onChanged.addListener
      >[0]

      if (typeof handleStorageChange === 'undefined') {
        throw new Error('Popup did not register a storage listener')
      }

      await act(async (): Promise<void> => {
        handleStorageChange({
          credentials: {
            newValue: {
              AWS_ACCESS_KEY_ID: '<access_key_id>',
              AWS_SECRET_ACCESS_KEY: '<secret_access_key>',
              AWS_SESSION_TOKEN: '<session_token>',
              _expiry: Date.now() + 60_000,
            },
          },
        })
      })

      expect(getRenderedElement().textContent).toContain(
        'export AWS_ACCESS_KEY_ID="<access_key_id>"',
      )
    })
  })

  it('removes the storage listener when the popup closes', async (): Promise<void> => {
    await renderComponent()

    const handleStorageChange = mockAddStorageListener.mock
      .calls[0]?.[0] as Parameters<
      typeof Browser.storage.local.onChanged.addListener
    >[0]

    if (typeof handleStorageChange === 'undefined') {
      throw new Error('Popup did not register a storage listener')
    }

    const currentRoot = root

    if (currentRoot == null) {
      throw new Error('Popup did not render')
    }

    await act(async (): Promise<void> => {
      currentRoot.unmount()
    })

    expect(mockRemoveStorageListener).toHaveBeenCalledWith(handleStorageChange)

    root = undefined
  })
})
