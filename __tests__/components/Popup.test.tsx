/** @jest-environment jsdom */

import { create, ReactTestRendererJSON } from 'react-test-renderer'
import * as React from 'react'
import Popup from '@/components/Popup'

describe('Popup', (): void => {
  describe('platform', (): void => {
    it('is configured to display macOS and Linux by default', (): void => {
      const component = create(<Popup />)
      const tree = component.toJSON() as ReactTestRendererJSON
      expect(tree).toMatchSnapshot()
    })
  })
})
