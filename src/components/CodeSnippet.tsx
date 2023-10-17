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
      className={`relative group border mb-2 ${
        hovering ? 'cursor-pointer' : ''
      }`}>
      <pre
        className={`p-2 border bg-gray-100`}
        onClick={copyToClipboard}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}>
        <code className={`font-mono`}>{code}</code>
      </pre>
      {hovering && (
        <div
          className={`absolute flex items-center justify-center pointer-events-none h-full top-0 left font-bold bg-black text-white opacity-75 w-full text-base`}>
          Click to copy
        </div>
      )}
      {copied && (
        <div
          className={`absolute flex items-center justify-center pointer-events-none h-full top-0 left-1/2 font-bold text-base transform -translate-x-1/2 opacity-90 bg-green-600 text-white w-full`}>
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}

export default CodeSnippet
