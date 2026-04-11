import { XMLParser } from 'fast-xml-parser'

export { XmlNode } from '@aws-sdk/xml-builder/dist-es/XmlNode.js'
export { XmlText } from '@aws-sdk/xml-builder/dist-es/XmlText.js'

// MV3 service workers do not provide DOMParser, so use the SDK's non-DOM parser.
const parser = new XMLParser({
  attributeNamePrefix: '',
  htmlEntities: true,
  ignoreAttributes: false,
  ignoreDeclaration: true,
  maxNestedTags: 1024,
  parseTagValue: false,
  tagValueProcessor: (_, value): string | undefined =>
    value.trim() === '' && value.includes('\n') ? '' : undefined,
  trimValues: false,
})

parser.addEntity('#xD', '\r')
parser.addEntity('#10', '\n')

export const parseXML = (xmlString: string): unknown =>
  parser.parse(xmlString, true)
