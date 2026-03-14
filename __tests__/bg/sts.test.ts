import {
  assumeRoleWithSAML,
  mapAssumedRoleCredentials,
  type STSClient,
} from '@/bg/sts'

describe('STS helpers', (): void => {
  beforeEach((): void => {
    jest.spyOn(console, 'log').mockImplementation((): void => undefined)
  })

  afterEach((): void => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('maps the STS response into stored credentials', (): void => {
    const expiration = new Date('2026-03-14T14:00:00.000Z')

    expect(
      mapAssumedRoleCredentials({
        Credentials: {
          AccessKeyId: '<access_key_id>',
          Expiration: expiration,
          SecretAccessKey: '<secret_access_key>',
          SessionToken: '<session_token>',
        },
      }),
    ).toEqual({
      AWS_ACCESS_KEY_ID: '<access_key_id>',
      AWS_SECRET_ACCESS_KEY: '<secret_access_key>',
      AWS_SESSION_TOKEN: '<session_token>',
      _expiry: expiration.getTime(),
    })
  })

  it('throws when STS does not return complete credentials', (): void => {
    expect((): void => {
      mapAssumedRoleCredentials({
        Credentials: undefined,
      })
    }).toThrow('AssumeRoleWithSAML did not return complete credentials.')
  })

  it('calls the STS client with the extracted role details', async (): Promise<void> => {
    const expiration = new Date('2026-03-14T14:00:00.000Z')
    const client: {
      assumeRoleWithSAML: jest.MockedFunction<STSClient['assumeRoleWithSAML']>
    } = {
      assumeRoleWithSAML: jest.fn(),
    }

    client.assumeRoleWithSAML.mockResolvedValue({
      Credentials: {
        AccessKeyId: '<access_key_id>',
        Expiration: expiration,
        SecretAccessKey: '<secret_access_key>',
        SessionToken: '<session_token>',
      },
      $metadata: {},
    })

    await expect(
      assumeRoleWithSAML(
        {
          principalArn: 'arn:aws:iam::123456789012:saml-provider/Example',
          roleArn: 'arn:aws:iam::123456789012:role/Admin',
          samlAssertion: '<saml_assertion>',
          sessionDuration: 7200,
        },
        client,
      ),
    ).resolves.toEqual({
      AWS_ACCESS_KEY_ID: '<access_key_id>',
      AWS_SECRET_ACCESS_KEY: '<secret_access_key>',
      AWS_SESSION_TOKEN: '<session_token>',
      _expiry: expiration.getTime(),
    })

    expect(client.assumeRoleWithSAML).toHaveBeenCalledWith({
      DurationSeconds: 7200,
      PrincipalArn: 'arn:aws:iam::123456789012:saml-provider/Example',
      RoleArn: 'arn:aws:iam::123456789012:role/Admin',
      SAMLAssertion: '<saml_assertion>',
    })
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Received STS credentials.'),
      expect.objectContaining({
        hasSecretAccessKey: true,
        hasSessionToken: true,
      }),
    )
  })
})
