import * as React from 'react'
import { useState } from 'react'

type CodeSnippetProps = {
  code: string
}

const CodeSnippet = ({ code }: CodeSnippetProps): React.ReactElement => {
  const [copied, setCopied] = useState(false)
  const [hovering, setHovering] = useState(false)

  const copyToClipboard = (): void => {
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(code).then((): void => {
        setHovering(false)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div
      className={`group relative mb-2 border ${
        hovering ? 'cursor-pointer' : ''
      }`}>
      <pre
        className={`overflow-x-scroll border bg-gray-100 p-2`}
        onClick={copyToClipboard}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}>
        <code className={`font-mono`}>{code}</code>
      </pre>
      {hovering && (
        <div
          className={`left pointer-events-none absolute top-0 flex h-full w-full items-center justify-center bg-black text-base font-bold text-white opacity-75`}>
          Click to copy
        </div>
      )}
      {copied && (
        <div
          className={`pointer-events-none absolute left-1/2 top-0 flex h-full w-full -translate-x-1/2 transform items-center justify-center bg-green-600 text-base font-bold text-white opacity-90`}>
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}

export default CodeSnippet
