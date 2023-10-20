import { onBeforeRequestEvent } from '../../src/bg/event'
import { WebRequest } from 'webextension-polyfill'

describe('Background worker', (): void => {
  describe('onBeforeRequestEvent', (): void => {
    it('throws an error when no form data is found', (): void => {
      expect((): void => {
        onBeforeRequestEvent({
          requestBody: {},
        } as WebRequest.OnBeforeRequestDetailsType)
      }).toThrow(Error)
    })
  })
})
