import {
  decodeSAMLAssertion,
  extractRoleArns,
  parseSAMLAssertion,
  selectRole,
} from '@/bg/saml'

const SAMPLE_SAML_XML = `
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

describe('SAML helpers', (): void => {
  it('can decode a raw base64-encoded SAML assertion', (): void => {
    const encodedAssertion = Buffer.from(SAMPLE_SAML_XML, 'utf8').toString(
      'base64',
    )

    expect(decodeSAMLAssertion(encodedAssertion)).toBe(SAMPLE_SAML_XML)
  })

  it('can decode a legacy percent-encoded SAML assertion', (): void => {
    const encodedAssertion = Buffer.from(
      encodeURIComponent(SAMPLE_SAML_XML),
      'utf8',
    ).toString('base64')

    expect(decodeSAMLAssertion(encodedAssertion)).toBe(SAMPLE_SAML_XML)
  })

  it('can parse roles and session duration from a SAML assertion', (): void => {
    expect(parseSAMLAssertion(SAMPLE_SAML_XML)).toEqual({
      roles: [
        'arn:aws:iam::123456789012:role/Admin,arn:aws:iam::123456789012:saml-provider/Example',
        'arn:aws:iam::123456789012:role/ReadOnly,arn:aws:iam::123456789012:saml-provider/Example',
      ],
      sessionDuration: 7200,
    })
  })

  it('defaults the session duration when the SAML assertion omits it', (): void => {
    const samlXmlWithoutSessionDuration = `
<Response>
  <Assertion>
    <AttributeStatement>
      <Attribute Name="https://aws.amazon.com/SAML/Attributes/Role">
        <AttributeValue>arn:aws:iam::123456789012:role/Admin,arn:aws:iam::123456789012:saml-provider/Example</AttributeValue>
      </Attribute>
    </AttributeStatement>
  </Assertion>
</Response>
`.trim()

    expect(parseSAMLAssertion(samlXmlWithoutSessionDuration)).toEqual({
      roles: [
        'arn:aws:iam::123456789012:role/Admin,arn:aws:iam::123456789012:saml-provider/Example',
      ],
      sessionDuration: 3600,
    })
  })

  it('can select a role using the posted role index', (): void => {
    const { roles } = parseSAMLAssertion(SAMPLE_SAML_XML)

    expect(selectRole(roles, 'ReadOnly')).toBe(
      'arn:aws:iam::123456789012:role/ReadOnly,arn:aws:iam::123456789012:saml-provider/Example',
    )
  })

  it('can select a role using the posted role ARN', (): void => {
    const { roles } = parseSAMLAssertion(SAMPLE_SAML_XML)

    expect(selectRole(roles, 'arn:aws:iam::123456789012:role/ReadOnly')).toBe(
      'arn:aws:iam::123456789012:role/ReadOnly,arn:aws:iam::123456789012:saml-provider/Example',
    )
  })

  it('can select the only available role when no role index is provided', (): void => {
    const samlXmlWithoutSessionDuration = `
<Response>
  <Assertion>
    <AttributeStatement>
      <Attribute Name="https://aws.amazon.com/SAML/Attributes/Role">
        <AttributeValue>arn:aws:iam::123456789012:role/Admin,arn:aws:iam::123456789012:saml-provider/Example</AttributeValue>
      </Attribute>
    </AttributeStatement>
  </Assertion>
</Response>
`.trim()

    const { roles } = parseSAMLAssertion(samlXmlWithoutSessionDuration)

    expect(selectRole(roles)).toBe(
      'arn:aws:iam::123456789012:role/Admin,arn:aws:iam::123456789012:saml-provider/Example',
    )
  })

  it('can extract the role and principal ARNs from a role selection', (): void => {
    expect(
      extractRoleArns(
        'arn:aws:iam::123456789012:role/Admin,arn:aws:iam::123456789012:saml-provider/Example',
      ),
    ).toEqual({
      principalArn: 'arn:aws:iam::123456789012:saml-provider/Example',
      roleArn: 'arn:aws:iam::123456789012:role/Admin',
    })
  })

  it('can extract role and principal ARNs for non-commercial AWS partitions', (): void => {
    expect(
      extractRoleArns(
        'arn:aws-us-gov:iam::123456789012:role/Admin,arn:aws-us-gov:iam::123456789012:saml-provider/Example',
      ),
    ).toEqual({
      principalArn: 'arn:aws-us-gov:iam::123456789012:saml-provider/Example',
      roleArn: 'arn:aws-us-gov:iam::123456789012:role/Admin',
    })
  })
})
