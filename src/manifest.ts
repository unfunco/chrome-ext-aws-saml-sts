import { type Manifest } from 'webextension-polyfill'
import pkg from '../package.json'

export const manifest: Manifest.WebExtensionManifest = {
  action: {
    default_popup: 'src/popup/index.html',
  },
  incognito: 'spanning',
  description: pkg.description,
  host_permissions: ['<all_urls>'],
  manifest_version: 3,
  name: 'AWS SAML to STS',
  permissions: ['storage', 'webRequest'],
  version: pkg.version,
}

// noinspection JSUnusedGlobalSymbols
export default manifest
