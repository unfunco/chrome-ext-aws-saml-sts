import {
  type AWSCredentials,
  iniSnippet,
  powershellSnippet,
  unixSnippet,
  windowsSnippet,
} from '@/utilities'

describe('Utilities', (): void => {
  describe('templates', (): void => {
    const creds: AWSCredentials = {
      AWS_ACCESS_KEY_ID: '<access_key_id>',
      AWS_SECRET_ACCESS_KEY: '<secret_access_key>',
      AWS_SESSION_TOKEN: '<session_token>',
    }

    it('can render INI credentials', (): void => {
      const rendered = iniSnippet(creds)
      expect(rendered).toEqual(`[default]
aws_access_key_id = ${creds.AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${creds.AWS_SECRET_ACCESS_KEY}
aws_session_token = ${creds.AWS_SESSION_TOKEN}`)
    })

    it('can render macOS and Linux credentials', (): void => {
      const rendered = unixSnippet(creds)
      expect(rendered)
        .toEqual(`export AWS_ACCESS_KEY_ID="${creds.AWS_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${creds.AWS_SECRET_ACCESS_KEY}"
export AWS_SESSION_TOKEN="${creds.AWS_SESSION_TOKEN}"`)
    })

    it('can render Windows credentials', (): void => {
      const rendered = windowsSnippet(creds)
      expect(rendered).toEqual(`SET AWS_ACCESS_KEY_ID=${creds.AWS_ACCESS_KEY_ID}
SET AWS_SECRET_ACCESS_KEY=${creds.AWS_SECRET_ACCESS_KEY}
SET AWS_SESSION_TOKEN=${creds.AWS_SESSION_TOKEN}`)
    })

    it('can render PowerShell credentials', (): void => {
      const rendered = powershellSnippet(creds)
      expect(rendered)
        .toEqual(`$Env:AWS_ACCESS_KEY_ID="${creds.AWS_ACCESS_KEY_ID}"
$Env:AWS_SECRET_ACCESS_KEY="${creds.AWS_SECRET_ACCESS_KEY}"
$Env:AWS_SESSION_TOKEN="${creds.AWS_SESSION_TOKEN}"`)
    })
  })
})
