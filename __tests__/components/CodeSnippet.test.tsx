/** @jest-environment jsdom */

import CodeSnippet from '@/components/CodeSnippet'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

describe('CodeSnippet', (): void => {
  const code = `const greeting = 'Hello, world!'`
  let container: HTMLDivElement | undefined
  let root: Root | undefined
  let clipboardWriteText: jest.Mock

  const renderComponent = async (): Promise<void> => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const nextRoot = createRoot(container)
    root = nextRoot

    await act(async (): Promise<void> => {
      nextRoot.render(<CodeSnippet code={code} ready={true} />)
    })
  }

  const getRenderedElement = (): Element => {
    if (container?.firstElementChild == null) {
      throw new Error('CodeSnippet did not render')
    }

    return container.firstElementChild
  }

  const getSnippetElement = (): HTMLPreElement => {
    const snippet = container?.querySelector('pre')

    if (!(snippet instanceof HTMLPreElement)) {
      throw new Error('CodeSnippet pre element was not rendered')
    }

    return snippet
  }

  beforeEach((): void => {
    jest.useFakeTimers()
    clipboardWriteText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWriteText,
      },
    })
  })

  afterEach(async (): Promise<void> => {
    jest.runOnlyPendingTimers()
    jest.clearAllTimers()
    jest.useRealTimers()

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

  describe('copy guidance', (): void => {
    it('is not shown by default', async (): Promise<void> => {
      await renderComponent()

      expect(getRenderedElement()).toMatchSnapshot()
      expect(container?.textContent).not.toContain('Click to copy')
      expect(container?.textContent).not.toContain('Copied to clipboard!')
    })

    it('is shown on hover', async (): Promise<void> => {
      await renderComponent()

      await act(async (): Promise<void> => {
        getSnippetElement().dispatchEvent(
          new MouseEvent('mouseover', { bubbles: true }),
        )
      })

      expect(getRenderedElement()).toMatchSnapshot()
      expect((getRenderedElement() as HTMLElement).className).toContain(
        'code-snippet--interactive',
      )
      expect(container?.textContent).toContain('Click to copy')
    })
  })

  describe('copy confirmation', (): void => {
    it('does not attempt to copy when credentials are not ready', async (): Promise<void> => {
      container = document.createElement('div')
      document.body.appendChild(container)
      const nextRoot = createRoot(container)
      root = nextRoot

      await act(async (): Promise<void> => {
        nextRoot.render(<CodeSnippet code={code} ready={false} />)
      })

      await act(async (): Promise<void> => {
        getSnippetElement().dispatchEvent(
          new MouseEvent('click', { bubbles: true }),
        )

        await Promise.resolve()
      })

      expect(clipboardWriteText).not.toHaveBeenCalled()
    })

    it('is shown after copying and clears after the timeout', async (): Promise<void> => {
      await renderComponent()

      await act(async (): Promise<void> => {
        getSnippetElement().dispatchEvent(
          new MouseEvent('click', { bubbles: true }),
        )

        await Promise.resolve()
      })

      expect(clipboardWriteText).toHaveBeenCalledWith(code)
      expect(getRenderedElement()).toMatchSnapshot()
      expect(container?.textContent).toContain('Copied to clipboard!')

      await act(async (): Promise<void> => {
        jest.advanceTimersByTime(2000)
      })

      expect(container?.textContent).not.toContain('Copied to clipboard!')
    })
  })
})
