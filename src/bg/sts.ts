import { summarizeCredentials } from '@/utilities/debug'
import type { AWSCredentials } from '@/utilities/snippets'
import { STS, type AssumeRoleWithSAMLCommandOutput } from '@aws-sdk/client-sts'

export type AssumeRoleWithSAMLRequest = {
  principalArn: string
  roleArn: string
  samlAssertion: string
  sessionDuration: number
}

export type STSClient = {
  assumeRoleWithSAML(input: {
    DurationSeconds: number
    PrincipalArn: string
    RoleArn: string
    SAMLAssertion: string
  }): Promise<AssumeRoleWithSAMLCommandOutput>
}

const stsClient: STSClient = new STS({
  // Region is required, but it's not used.
  region: 'eu-west-1',
  useGlobalEndpoint: true,
})
const LOG_PREFIX = '[AWS SAML to STS][sts]'

export const mapAssumedRoleCredentials = (
  response: Pick<AssumeRoleWithSAMLCommandOutput, 'Credentials'>,
): AWSCredentials => {
  const credentials = response.Credentials

  if (
    !credentials?.AccessKeyId ||
    !credentials.SecretAccessKey ||
    !credentials.SessionToken ||
    !credentials.Expiration
  ) {
    throw new Error('AssumeRoleWithSAML did not return complete credentials.')
  }

  return {
    AWS_ACCESS_KEY_ID: credentials.AccessKeyId,
    AWS_SECRET_ACCESS_KEY: credentials.SecretAccessKey,
    AWS_SESSION_TOKEN: credentials.SessionToken,
    _expiry: credentials.Expiration.getTime(),
  }
}

export const assumeRoleWithSAML = async (
  request: AssumeRoleWithSAMLRequest,
  client: STSClient = stsClient,
): Promise<AWSCredentials> => {
  console.log(`${LOG_PREFIX} Exchanging SAML assertion for STS credentials.`, {
    hasPrincipalArn: request.principalArn.length > 0,
    hasRoleArn: request.roleArn.length > 0,
    sessionDuration: request.sessionDuration,
  })
  const response = await client.assumeRoleWithSAML({
    DurationSeconds: request.sessionDuration,
    PrincipalArn: request.principalArn,
    RoleArn: request.roleArn,
    SAMLAssertion: request.samlAssertion,
  })

  const credentials = mapAssumedRoleCredentials(response)

  console.log(
    `${LOG_PREFIX} Received STS credentials.`,
    summarizeCredentials(credentials),
  )

  return credentials
}
