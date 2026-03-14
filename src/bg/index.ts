import Browser from 'webextension-polyfill'
import { onBeforeRequestEvent } from '@/bg/event'
import { startCredentialGarbageCollector } from '@/bg/gc'

const AWS_SIGNIN_URL_SAML = 'https://signin.aws.amazon.com/saml'
const LOG_PREFIX = '[AWS SAML to STS][background]'

console.log(`${LOG_PREFIX} Initializing background worker.`, {
  requestUrl: AWS_SIGNIN_URL_SAML,
})

if (Browser.webRequest.onBeforeRequest.hasListener(onBeforeRequestEvent)) {
  Browser.webRequest.onBeforeRequest.removeListener(onBeforeRequestEvent)
  console.log(`${LOG_PREFIX} Removed existing AWS SAML request listener.`)
}

Browser.webRequest.onBeforeRequest.addListener(
  onBeforeRequestEvent,
  { urls: [AWS_SIGNIN_URL_SAML] },
  ['requestBody'],
)
console.log(`${LOG_PREFIX} Registered AWS SAML request listener.`, {
  requestUrl: AWS_SIGNIN_URL_SAML,
})

// Run credential cleanup immediately and while the service worker is awake.
startCredentialGarbageCollector()
console.log(`${LOG_PREFIX} Started credential garbage collector.`)
