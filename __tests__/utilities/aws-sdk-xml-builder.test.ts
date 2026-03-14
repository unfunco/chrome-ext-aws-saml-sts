jest.mock('@aws-sdk/xml-builder/dist-es/XmlNode.js', () => ({
  XmlNode: class XmlNode {},
}))

jest.mock('@aws-sdk/xml-builder/dist-es/XmlText.js', () => ({
  XmlText: class XmlText {},
}))

import { parseXML } from '@/utilities/aws-sdk-xml-builder'

describe('AWS SDK XML builder shim', (): void => {
  it('parses AWS STS XML without DOMParser', (): void => {
    expect(
      parseXML(`
        <AssumeRoleWithSAMLResponse xmlns="https://sts.amazonaws.com/doc/2011-06-15/">
          <AssumeRoleWithSAMLResult>
            <Credentials>
              <AccessKeyId>AKIAEXAMPLEKEY</AccessKeyId>
              <SecretAccessKey>secret-access-key</SecretAccessKey>
              <SessionToken>session-token</SessionToken>
              <Expiration>2026-03-14T14:00:00.000Z</Expiration>
            </Credentials>
          </AssumeRoleWithSAMLResult>
          <ResponseMetadata>
            <RequestId>request-id</RequestId>
          </ResponseMetadata>
        </AssumeRoleWithSAMLResponse>
      `),
    ).toEqual({
      AssumeRoleWithSAMLResponse: {
        AssumeRoleWithSAMLResult: {
          Credentials: {
            AccessKeyId: 'AKIAEXAMPLEKEY',
            Expiration: '2026-03-14T14:00:00.000Z',
            SecretAccessKey: 'secret-access-key',
            SessionToken: 'session-token',
          },
        },
        ResponseMetadata: {
          RequestId: 'request-id',
        },
        xmlns: 'https://sts.amazonaws.com/doc/2011-06-15/',
      },
    })
  })
})
