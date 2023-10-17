/** @jest-environment jsdom */

import { act, create, ReactTestRendererJSON } from 'react-test-renderer'
import CodeSnippet from '@/components/CodeSnippet'
import * as React from 'react'

describe('CodeSnippet', (): void => {
  const code = `const greeting = 'Hello, world!'`

  beforeEach((): void => {
    jest.useFakeTimers()
  })

  afterEach((): void => {
    jest.clearAllTimers()
  })

  describe('copy guidance', (): void => {
    it('is not shown by default', (): void => {
      const component = create(<CodeSnippet code={code} />)
      const tree = component.toJSON() as ReactTestRendererJSON
      expect(tree).toMatchSnapshot()
    })

    it('is shown on hover', (): void => {
      const component = create(<CodeSnippet code={code} />)
      let tree = component.toJSON() as ReactTestRendererJSON
      expect(tree).toMatchSnapshot()

      act((): void => {
        const pre = tree.children![0] as ReactTestRendererJSON
        pre.props.onMouseEnter()
      })

      tree = component.toJSON() as ReactTestRendererJSON
      expect(tree).toMatchSnapshot()
    })
  })

  describe('copy confirmation', (): void => {
    it('is not shown by default', (): void => {
      const component = create(<CodeSnippet code={code} />)
      const tree = component.toJSON() as ReactTestRendererJSON
      expect(tree).toMatchSnapshot()
    })
  })
})
