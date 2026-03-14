import * as React from 'react'
import { useState } from 'react'

type CodeSnippetProps = {
  code: string
  ready: boolean
}
const LOG_PREFIX = '[AWS SAML to STS][code-snippet]'

const CodeSnippet = ({ code, ready }: CodeSnippetProps): React.ReactElement => {
  const [copied, setCopied] = useState(false)
  const [hovering, setHovering] = useState(false)

  const copyToClipboard = (): void => {
    if (!ready || !('clipboard' in navigator)) {
      return
    }

    void navigator.clipboard
      .writeText(code)
      .then((): void => {
        setHovering(false)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((error: unknown): void => {
        console.error(
          `${LOG_PREFIX} Failed to copy credentials to the clipboard.`,
          error,
        )
      })
  }

  return (
    <div
      className={`code-snippet ${ready && hovering ? 'code-snippet--interactive' : ''}`}>
      <pre
        className={`code-snippet__pre`}
        onClick={copyToClipboard}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}>
        {ready && <code className={`code-snippet__code`}>{code}</code>}
        {!ready && (
          <span className={'code-snippet__placeholder'}>
            Sign-in to AWS to see credentials...
          </span>
        )}
      </pre>
      {ready && hovering && (
        <div className={`code-snippet__overlay`}>Click to copy</div>
      )}
      {ready && copied && (
        <div className={`code-snippet__overlay code-snippet__overlay--success`}>
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}

export default CodeSnippet
