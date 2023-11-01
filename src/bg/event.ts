import { WebRequest } from 'webextension-polyfill'
import { XMLParser } from 'fast-xml-parser'
import { AssumeRoleWithSAMLCommandOutput, STS } from '@aws-sdk/client-sts'

const sts = new STS({
  // Region is required, but it's not used.
  region: 'eu-west-1',
  useGlobalEndpoint: true,
})

const xmlParser = new XMLParser({
  alwaysCreateTextNode: true,
  ignoreAttributes: false,
  removeNSPrefix: true,
})

type Role = {
  '#text': string
  '@_type': string
}

export const onBeforeRequestEvent = (
  details: WebRequest.OnBeforeRequestDetailsType,
): void | WebRequest.BlockingResponseOrPromise => {
  if (!details.requestBody?.formData) {
    throw new Error('Could not find form data')
  }

  // If the user is in the process of selecting a role,
  // don't do anything.
  if (!('roleIndex' in details.requestBody.formData)) {
    return
  }

  const samlAssertion = details.requestBody.formData.SAMLResponse[0]
  const samlXmlDoc = decodeURIComponent(atob(samlAssertion))
  const roleIndex = details.requestBody.formData.roleIndex[0]

  let roles: Role[] = []
  let sessionDuration = 3600

  const document = xmlParser.parse(samlXmlDoc)
  const attrs =
    document['Response']['Assertion']['AttributeStatement']['Attribute']
  for (const attr of attrs) {
    if (typeof attr['@_Name'] === 'undefined') {
      continue
    }

    if (attr['@_Name'] === 'https://aws.amazon.com/SAML/Attributes/Role') {
      roles = attr.AttributeValue
    } else if (
      attr['@_Name'] ===
      'https://aws.amazon.com/SAML/Attributes/SessionDuration'
    ) {
      sessionDuration = parseInt(attr.AttributeValue['#text'], 10)
    }
  }

  let role = null
  if (roles.length > 0 && !!roleIndex) {
    for (let i = 0; i < roles.length; i++) {
      if (roles[i]['#text'].indexOf(roleIndex) === -1) {
        role = roles[i]['#text']
        break
      }
    }
  }

  if (role === null) {
    throw new Error('Could not determine a role to assume.')
  }

  sts
    .assumeRoleWithSAML({
      DurationSeconds: sessionDuration,
      PrincipalArn: role.match(
        /arn:aws:iam:[^:]*:[0-9]+:saml-provider\/[^,]+/i,
      )![0],
      RoleArn: role.match(/arn:aws:iam:[^:]*:[0-9]+:role\/[^,]+/i)![0],
      SAMLAssertion: samlAssertion,
    })
    .then(
      (data: AssumeRoleWithSAMLCommandOutput): void => {
        if (data !== void 0) {
          console.log(data)
        }
      },
      (error: unknown): void => {
        console.error(error)
      },
    )

  return new Promise((): { cancel: boolean } => {
    return { cancel: false }
  })
}
