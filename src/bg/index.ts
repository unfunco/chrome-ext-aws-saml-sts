import Browser from 'webextension-polyfill'
import { onBeforeRequestEvent } from '@/bg/event'
import { gc } from '@/bg/gc'

const AWS_SIGNIN_URL_SAML = 'https://signin.aws.amazon.com/saml'

if (Browser.webRequest.onBeforeRequest.hasListener(onBeforeRequestEvent)) {
  Browser.webRequest.onBeforeRequest.removeListener(onBeforeRequestEvent)
}

Browser.webRequest.onBeforeRequest.addListener(
  onBeforeRequestEvent,
  { urls: [AWS_SIGNIN_URL_SAML] },
  ['requestBody'],
)

// Run garbage collection every 30 seconds to remove expired credentials
// from local storage.
// noinspection JSIgnoredPromiseFromCall
gc(30_000)
