export type Credentials = {
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  AWS_SESSION_TOKEN: string
}

export const iniCredentials = (creds: Credentials): string =>
  [
    `[default]`,
    `aws_access_key_id=${creds.AWS_ACCESS_KEY_ID}`,
    `aws_secret_access_key=${creds.AWS_SECRET_ACCESS_KEY}`,
    `aws_session_token=${creds.AWS_SESSION_TOKEN}`,
  ].join('\n')

export const powershellCredentials = (creds: Credentials): string =>
  [
    `$Env:AWS_ACCESS_KEY_ID="${creds.AWS_ACCESS_KEY_ID}"`,
    `$Env:AWS_SECRET_ACCESS_KEY="${creds.AWS_SECRET_ACCESS_KEY}"`,
    `$Env:AWS_SESSION_TOKEN="${creds.AWS_SESSION_TOKEN}"`,
  ].join('\n')

export const unixCredentials = (creds: Credentials): string =>
  [
    `export AWS_ACCESS_KEY_ID="${creds.AWS_ACCESS_KEY_ID}"`,
    `export AWS_SECRET_ACCESS_KEY="${creds.AWS_SECRET_ACCESS_KEY}"`,
    `export AWS_SESSION_TOKEN="${creds.AWS_SESSION_TOKEN}"`,
  ].join('\n')

export const windowsCredentials = (creds: Credentials): string =>
  [
    `SET AWS_ACCESS_KEY_ID=${creds.AWS_ACCESS_KEY_ID}`,
    `SET AWS_SECRET_ACCESS_KEY=${creds.AWS_SECRET_ACCESS_KEY}`,
    `SET AWS_SESSION_TOKEN=${creds.AWS_SESSION_TOKEN}`,
  ].join('\n')
