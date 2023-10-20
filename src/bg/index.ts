import Browser from 'webextension-polyfill'
import { onBeforeRequestEvent } from '@/bg/event'

const AWS_SIGNIN_URL_SAML = 'https://signin.aws.amazon.com/saml'

if (Browser.webRequest.onBeforeRequest.hasListener(onBeforeRequestEvent)) {
  Browser.webRequest.onBeforeRequest.removeListener(onBeforeRequestEvent)
}

Browser.webRequest.onBeforeRequest.addListener(
  onBeforeRequestEvent,
  { urls: [AWS_SIGNIN_URL_SAML] },
  ['requestBody'],
)
