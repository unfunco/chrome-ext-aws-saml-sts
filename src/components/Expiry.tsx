import React from 'react'
import { getRelativeTime } from '@/utilities'

type ExpiryProps = {
  /**
   * The time in milliseconds since the Unix Epoch.
   */
  time: number
}

/**
 * Expiry is a React component that displays the relative time until a
 * given time.
 *
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.time - The time in milliseconds since the Unix Epoch.
 *
 * @example
 * <Expiry time={Date.now() + 3600}/>
 *
 * @returns {React.ReactElement} The React component.
 */
const Expiry = ({ time }: ExpiryProps): React.ReactElement => {
  /** The expiry time as a Date object. */
  const expiryTime = new Date(time)

  return (
    <p className={`text-center text-xs text-gray-500 dark:text-gray-300`}>
      Credentials expire{' '}
      <time dateTime={expiryTime.toISOString()}>
        {getRelativeTime(expiryTime)}
      </time>
    </p>
  )
}

export default Expiry
