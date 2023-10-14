import React from 'react'
import CodeSnippet from '@/components/CodeSnippet'

const sampleExports = `export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
`

const sampleIni = `[default]
aws_access_key_id=...
aws_secret_access_key=...
aws_session_token=...
`

const Popup = (): React.ReactElement => {
  return (
    <div id={`popup`} className={`bg-gray-100 p-2`}>
      <CodeSnippet code={sampleExports}/>
      <CodeSnippet code={sampleIni}/>
    </div>
  )
}

export default Popup
