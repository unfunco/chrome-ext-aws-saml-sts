import type { WebRequest } from 'webextension-polyfill'
import { handleBeforeRequestEvent } from '@/bg/event'
import { assumeRoleWithSAML } from '@/bg/sts'
import { saveCredentials } from '@/utilities/storage'

jest.mock('@/bg/sts', () => ({
  assumeRoleWithSAML: jest.fn(),
}))

jest.mock('@/utilities/storage', () => ({
  saveCredentials: jest.fn(),
}))

describe('Background worker', (): void => {
  const mockAssumeRoleWithSAML = assumeRoleWithSAML as jest.MockedFunction<
    typeof assumeRoleWithSAML
  >
  const mockSaveCredentials = saveCredentials as jest.MockedFunction<
    typeof saveCredentials
  >
  const credentials = {
    AWS_ACCESS_KEY_ID: '<access_key_id>',
    AWS_SECRET_ACCESS_KEY: '<secret_access_key>',
    AWS_SESSION_TOKEN: '<session_token>',
    _expiry: Date.parse('2026-03-14T14:00:00.000Z'),
  }
  const singleRoleSamlXml = `
<Response>
  <Assertion>
    <AttributeStatement>
      <Attribute Name="https://aws.amazon.com/SAML/Attributes/Role">
        <AttributeValue>arn:aws:iam::123456789012:role/Admin,arn:aws:iam::123456789012:saml-provider/Example</AttributeValue>
      </Attribute>
      <Attribute Name="https://aws.amazon.com/SAML/Attributes/SessionDuration">
        <AttributeValue>7200</AttributeValue>
      </Attribute>
    </AttributeStatement>
  </Assertion>
</Response>
`.trim()
  const singleRoleSamlAssertion = Buffer.from(
    encodeURIComponent(singleRoleSamlXml),
    'utf8',
  ).toString('base64')
  const multiRoleSamlXml = `
<Response>
  <Assertion>
    <AttributeStatement>
      <Attribute Name="https://aws.amazon.com/SAML/Attributes/Role">
        <AttributeValue>arn:aws:iam::123456789012:role/Admin,arn:aws:iam::123456789012:saml-provider/Example</AttributeValue>
        <AttributeValue>arn:aws:iam::123456789012:role/ReadOnly,arn:aws:iam::123456789012:saml-provider/Example</AttributeValue>
      </Attribute>
      <Attribute Name="https://aws.amazon.com/SAML/Attributes/SessionDuration">
        <AttributeValue>7200</AttributeValue>
      </Attribute>
    </AttributeStatement>
  </Assertion>
</Response>
`.trim()
  const multiRoleSamlAssertion = Buffer.from(
    encodeURIComponent(multiRoleSamlXml),
    'utf8',
  ).toString('base64')

  beforeEach((): void => {
    jest.spyOn(console, 'error').mockImplementation((): void => undefined)
    jest.spyOn(console, 'log').mockImplementation((): void => undefined)
    mockAssumeRoleWithSAML.mockResolvedValue(credentials)
    mockSaveCredentials.mockResolvedValue(undefined)
  })

  afterEach((): void => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  describe('handleBeforeRequestEvent', (): void => {
    it('throws an error when no form data is found', async (): Promise<void> => {
      await expect(
        handleBeforeRequestEvent({
          requestBody: {},
        } as unknown as WebRequest.OnBeforeRequestDetailsType),
      ).rejects.toThrow('Could not find form data')
    })

    it('ignores multi-role requests that do not include a role selection', async (): Promise<void> => {
      await expect(
        handleBeforeRequestEvent({
          requestBody: {
            formData: {
              SAMLResponse: [multiRoleSamlAssertion],
            },
          },
        } as unknown as WebRequest.OnBeforeRequestDetailsType),
      ).resolves.toBeUndefined()

      expect(mockAssumeRoleWithSAML).not.toHaveBeenCalled()
      expect(mockSaveCredentials).not.toHaveBeenCalled()
    })

    it('uses the only role when the request does not include a role selection', async (): Promise<void> => {
      await handleBeforeRequestEvent({
        requestBody: {
          formData: {
            SAMLResponse: [singleRoleSamlAssertion],
          },
        },
      } as unknown as WebRequest.OnBeforeRequestDetailsType)

      expect(mockAssumeRoleWithSAML).toHaveBeenCalledWith({
        principalArn: 'arn:aws:iam::123456789012:saml-provider/Example',
        roleArn: 'arn:aws:iam::123456789012:role/Admin',
        samlAssertion: singleRoleSamlAssertion,
        sessionDuration: 7200,
      })
      expect(mockSaveCredentials).toHaveBeenCalledWith(credentials)
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'No role selection was submitted; using the only role in the assertion.',
        ),
        expect.objectContaining({
          roleCount: 1,
          sessionDuration: 7200,
        }),
      )
    })

    it('exchanges the selected role for credentials and stores them', async (): Promise<void> => {
      await handleBeforeRequestEvent({
        requestBody: {
          formData: {
            SAMLResponse: [singleRoleSamlAssertion],
            roleIndex: ['Admin'],
          },
        },
      } as unknown as WebRequest.OnBeforeRequestDetailsType)

      expect(mockAssumeRoleWithSAML).toHaveBeenCalledWith({
        principalArn: 'arn:aws:iam::123456789012:saml-provider/Example',
        roleArn: 'arn:aws:iam::123456789012:role/Admin',
        samlAssertion: singleRoleSamlAssertion,
        sessionDuration: 7200,
      })
      expect(mockSaveCredentials).toHaveBeenCalledWith(credentials)
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Credentials saved after AWS sign-in.'),
        expect.objectContaining({
          hasSecretAccessKey: true,
          hasSessionToken: true,
        }),
      )
    })
  })
})
