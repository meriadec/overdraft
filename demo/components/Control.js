import React from 'react'
import cx from 'classnames'

export default function Control(props) {
  const { onPress, label, active, style } = props

  return (
    <button
      className={cx('demo-overdraft-control', { active })}
      style={style}
      onMouseDown={e => {
        e.preventDefault()
        e.stopPropagation()
        onPress()
      }}
    >
      {label}
    </button>
  )
}
