import { type Manifest } from 'webextension-polyfill'
import pkg from '../package.json'

export const manifest: Manifest.WebExtensionManifest = {
  action: {
    default_popup: 'src/popup/index.html',
  },
  author: `${pkg.author.name} <${pkg.author.email}>`,
  background: {
    service_worker: 'src/bg/index.ts',
    type: 'module',
  },
  default_locale: 'en',
  description: pkg.description,
  host_permissions: ['https://signin.aws.amazon.com/saml'],
  icons: {
    '16': 'public/16.png',
    '32': 'public/32.png',
    '64': 'public/64.png',
    '128': 'public/128.png',
  },
  incognito: 'spanning',
  manifest_version: 3,
  name: 'AWS SAML to STS',
  permissions: ['storage', 'webRequest'],
  version: pkg.version,
}

// noinspection JSUnusedGlobalSymbols
export default manifest
