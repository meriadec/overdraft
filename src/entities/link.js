import React from 'react'

function Link(props) {
  const { contentState, entityKey, children } = props

  const { href } = contentState.getEntity(entityKey).getData()

  return (
    <a href={href}>
      {children}
    </a>
  )
}

const linkEntity = {
  strategy: (contentBlock, done, contentState) => {
    contentBlock.findEntityRanges(character => {
      const entityKey = character.getEntity()
      return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK'
    }, done)
  },
  component: Link,
}

export default linkEntity
