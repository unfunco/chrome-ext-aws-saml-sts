export type AWSCredentials = {
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  AWS_SESSION_TOKEN: string
}

export const iniSnippet = (credentials: AWSCredentials): string =>
  [
    `[default]`,
    `aws_access_key_id = ${credentials.AWS_ACCESS_KEY_ID}`,
    `aws_secret_access_key = ${credentials.AWS_SECRET_ACCESS_KEY}`,
    `aws_session_token = ${credentials.AWS_SESSION_TOKEN}`,
  ].join('\n')

export const powershellSnippet = (credentials: AWSCredentials): string =>
  [
    `$Env:AWS_ACCESS_KEY_ID="${credentials.AWS_ACCESS_KEY_ID}"`,
    `$Env:AWS_SECRET_ACCESS_KEY="${credentials.AWS_SECRET_ACCESS_KEY}"`,
    `$Env:AWS_SESSION_TOKEN="${credentials.AWS_SESSION_TOKEN}"`,
  ].join('\n')

export const unixSnippet = (credentials: AWSCredentials): string =>
  [
    `export AWS_ACCESS_KEY_ID="${credentials.AWS_ACCESS_KEY_ID}"`,
    `export AWS_SECRET_ACCESS_KEY="${credentials.AWS_SECRET_ACCESS_KEY}"`,
    `export AWS_SESSION_TOKEN="${credentials.AWS_SESSION_TOKEN}"`,
  ].join('\n')

export const windowsSnippet = (credentials: AWSCredentials): string =>
  [
    `SET AWS_ACCESS_KEY_ID=${credentials.AWS_ACCESS_KEY_ID}`,
    `SET AWS_SECRET_ACCESS_KEY=${credentials.AWS_SECRET_ACCESS_KEY}`,
    `SET AWS_SESSION_TOKEN=${credentials.AWS_SESSION_TOKEN}`,
  ].join('\n')
