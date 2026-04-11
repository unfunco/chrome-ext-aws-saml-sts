import { isAWSCredentials, type AWSCredentials } from '@/utilities/snippets'

const formatTimestamp = (value: number): string => new Date(value).toISOString()

const getSuffix = (value: string): string =>
  value.length === 0 ? '(missing)' : value.slice(-4)

export const summarizeCredentials = (
  credentials: AWSCredentials,
): {
  accessKeySuffix: string
  expired: boolean
  expiresAt: string
  expiresInMs: number
  hasSecretAccessKey: boolean
  hasSessionToken: boolean
} => {
  const expiresInMs = credentials._expiry - Date.now()

  return {
    accessKeySuffix: getSuffix(credentials.AWS_ACCESS_KEY_ID),
    expired: expiresInMs <= 0,
    expiresAt: formatTimestamp(credentials._expiry),
    expiresInMs,
    hasSecretAccessKey: credentials.AWS_SECRET_ACCESS_KEY.length > 0,
    hasSessionToken: credentials.AWS_SESSION_TOKEN.length > 0,
  }
}

export const summarizeCredentialValue = (
  value: unknown,
): {
  present: boolean
  valid: boolean
  valueType?: string
  accessKeySuffix?: string
  expired?: boolean
  expiresAt?: string
  expiresInMs?: number
  hasSecretAccessKey?: boolean
  hasSessionToken?: boolean
} => {
  if (typeof value === 'undefined') {
    return {
      present: false,
      valid: false,
    }
  }

  if (!isAWSCredentials(value)) {
    return {
      present: true,
      valid: false,
      valueType: Array.isArray(value) ? 'array' : typeof value,
    }
  }

  return {
    present: true,
    valid: true,
    ...summarizeCredentials(value),
  }
}
