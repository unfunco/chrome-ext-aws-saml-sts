/** @jest-environment jsdom */

import * as React from 'react'
import Popup from '@/components/Popup'
import Browser from 'webextension-polyfill'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

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
    mockGet.mockResolvedValue({})
    mockSet.mockResolvedValue(undefined)
  })

  afterEach(async (): Promise<void> => {
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
    it('is configured to display macOS and Linux by default', async (): Promise<void> => {
      await renderComponent()

      expect(mockGet).toHaveBeenCalledWith('credentials')
      expect(mockGet).toHaveBeenCalledWith('platform')
      expect(mockSet).not.toHaveBeenCalled()
      expect(getRenderedElement()).toMatchSnapshot()
    })
  })
})
