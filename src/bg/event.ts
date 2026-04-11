import {
  decodeSAMLAssertion,
  extractRoleArns,
  parseSAMLAssertion,
  selectRole,
} from '@/bg/saml'
import { assumeRoleWithSAML } from '@/bg/sts'
import { summarizeCredentials } from '@/utilities/debug'
import { saveCredentials } from '@/utilities/storage'
import type { WebRequest } from 'webextension-polyfill'

type RequestFormData = Record<string, string | string[] | undefined>
const LOG_PREFIX = '[AWS SAML to STS][webRequest]'

const summarizeRequest = (
  details: WebRequest.OnBeforeRequestDetailsType,
): {
  method: string | undefined
  requestId: string
  tabId: number
  timeStamp: number
  url: string
} => ({
  method: details.method,
  requestId: details.requestId,
  tabId: details.tabId,
  timeStamp: details.timeStamp,
  url: details.url,
})

const summarizeFormData = (
  formData: RequestFormData,
): {
  fields: string[]
  hasRoleIndex: boolean
  hasSAMLResponse: boolean
} => ({
  fields: Object.keys(formData).sort(),
  hasRoleIndex: 'roleIndex' in formData,
  hasSAMLResponse: 'SAMLResponse' in formData,
})

const getRequiredFormValue = (
  formData: RequestFormData,
  fieldName: string,
): string => {
  const fieldValue = formData[fieldName]
  const value = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue

  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Could not find ${fieldName} in form data.`)
  }

  return value
}

export const handleBeforeRequestEvent = async (
  details: WebRequest.OnBeforeRequestDetailsType,
): Promise<void> => {
  console.log(`${LOG_PREFIX} Intercepted AWS sign-in request.`, {
    ...summarizeRequest(details),
    hasFormData: Boolean(details.requestBody?.formData),
  })

  if (!details.requestBody?.formData) {
    console.error(
      `${LOG_PREFIX} Request did not include form data.`,
      summarizeRequest(details),
    )
    throw new Error('Could not find form data')
  }

  const formData: RequestFormData = details.requestBody.formData
  console.log(
    `${LOG_PREFIX} Parsed request form data.`,
    summarizeFormData(formData),
  )

  const samlAssertion = getRequiredFormValue(formData, 'SAMLResponse')
  const roleIndex =
    'roleIndex' in formData
      ? getRequiredFormValue(formData, 'roleIndex')
      : undefined
  const samlXmlDoc = decodeSAMLAssertion(samlAssertion)
  const parsedAssertion = parseSAMLAssertion(samlXmlDoc)
  console.log(`${LOG_PREFIX} Parsed SAML assertion.`, {
    roleCount: parsedAssertion.roles.length,
    selectedRoleIndex: roleIndex,
    sessionDuration: parsedAssertion.sessionDuration,
  })

  if (typeof roleIndex === 'undefined') {
    if (parsedAssertion.roles.length > 1) {
      console.log(
        `${LOG_PREFIX} Waiting for explicit role selection because the assertion contains multiple roles.`,
        {
          roleCount: parsedAssertion.roles.length,
          sessionDuration: parsedAssertion.sessionDuration,
        },
      )
      return
    }

    console.log(
      `${LOG_PREFIX} No role selection was submitted; using the only role in the assertion.`,
      {
        roleCount: parsedAssertion.roles.length,
        sessionDuration: parsedAssertion.sessionDuration,
      },
    )
  }

  const role = selectRole(parsedAssertion.roles, roleIndex)
  const { principalArn, roleArn } = extractRoleArns(role)
  console.log(`${LOG_PREFIX} Requesting STS credentials for selected role.`, {
    hasPrincipalArn: principalArn.length > 0,
    hasRoleArn: roleArn.length > 0,
    selectedRoleIndex: roleIndex,
    sessionDuration: parsedAssertion.sessionDuration,
  })
  const credentials = await assumeRoleWithSAML({
    principalArn,
    roleArn,
    samlAssertion,
    sessionDuration: parsedAssertion.sessionDuration,
  })

  await saveCredentials(credentials)
  console.log(
    `${LOG_PREFIX} Credentials saved after AWS sign-in.`,
    summarizeCredentials(credentials),
  )
}

export const onBeforeRequestEvent = (
  details: WebRequest.OnBeforeRequestDetailsType,
): void => {
  void handleBeforeRequestEvent(details).catch((error: unknown): void => {
    console.error(
      `${LOG_PREFIX} Failed to process AWS sign-in request.`,
      summarizeRequest(details),
      error,
    )
  })
}
