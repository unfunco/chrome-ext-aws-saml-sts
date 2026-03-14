import { XMLParser } from 'fast-xml-parser'

const DEFAULT_SESSION_DURATION = 3600
const ROLE_ATTRIBUTE_NAME = 'https://aws.amazon.com/SAML/Attributes/Role'
const SESSION_DURATION_ATTRIBUTE_NAME =
  'https://aws.amazon.com/SAML/Attributes/SessionDuration'
const PRINCIPAL_ARN_PATTERN = /arn:aws:iam:[^:]*:[0-9]+:saml-provider\/[^,]+/i
const ROLE_ARN_PATTERN = /arn:aws:iam:[^:]*:[0-9]+:role\/[^,]+/i

type AttributeValueNode = {
  '#text': string
}

type ParsedAttribute = {
  '@_Name'?: string
  AttributeValue: AttributeValueNode | AttributeValueNode[]
}

type ParsedSAMLDocument = {
  Response?: {
    Assertion?: {
      AttributeStatement?: {
        Attribute?: ParsedAttribute | ParsedAttribute[]
      }
    }
  }
}

export type ParsedSAMLAssertion = {
  roles: string[]
  sessionDuration: number
}

const xmlParser = new XMLParser({
  alwaysCreateTextNode: true,
  ignoreAttributes: false,
  removeNSPrefix: true,
})

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (typeof value === 'undefined') {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export const decodeSAMLAssertion = (samlAssertion: string): string =>
  decodeURIComponent(atob(samlAssertion))

export const parseSAMLAssertion = (samlXmlDoc: string): ParsedSAMLAssertion => {
  const document = xmlParser.parse(samlXmlDoc) as ParsedSAMLDocument
  const attributes = toArray(
    document.Response?.Assertion?.AttributeStatement?.Attribute,
  )

  if (attributes.length === 0) {
    throw new Error('Could not find SAML attributes.')
  }

  let roles: string[] = []
  let sessionDuration = DEFAULT_SESSION_DURATION

  for (const attribute of attributes) {
    if (typeof attribute['@_Name'] === 'undefined') {
      continue
    }

    if (attribute['@_Name'] === ROLE_ATTRIBUTE_NAME) {
      roles = toArray(attribute.AttributeValue).map(
        (attributeValue): string => attributeValue['#text'],
      )
    }

    if (attribute['@_Name'] === SESSION_DURATION_ATTRIBUTE_NAME) {
      const [attributeValue] = toArray(attribute.AttributeValue)

      if (typeof attributeValue === 'undefined') {
        continue
      }

      const parsedDuration = parseInt(attributeValue['#text'], 10)

      if (Number.isFinite(parsedDuration)) {
        sessionDuration = parsedDuration
      }
    }
  }

  return {
    roles,
    sessionDuration,
  }
}

export const selectRole = (roles: string[], roleIndex?: string): string => {
  if (typeof roleIndex === 'string' && roleIndex.length > 0) {
    const role = roles.find((candidate): boolean =>
      candidate.includes(roleIndex),
    )

    if (typeof role !== 'undefined') {
      return role
    }
  }

  if (roles.length === 1) {
    const [role] = roles

    if (typeof role !== 'undefined') {
      return role
    }
  }

  throw new Error('Could not determine a role to assume.')
}

export const extractRoleArns = (
  role: string,
): {
  principalArn: string
  roleArn: string
} => {
  const principalArn = role.match(PRINCIPAL_ARN_PATTERN)?.[0]
  const roleArn = role.match(ROLE_ARN_PATTERN)?.[0]

  if (typeof principalArn === 'undefined' || typeof roleArn === 'undefined') {
    throw new Error('Could not parse role ARNs from SAML assertion.')
  }

  return {
    principalArn,
    roleArn,
  }
}
