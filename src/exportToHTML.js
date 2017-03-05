import React from 'react'
import { convertToHTML } from 'draft-convert'
import { Map } from 'immutable'

import {
  DefaultDraftBlockRenderMap,
} from 'draft-js'

const blockRenderMap = DefaultDraftBlockRenderMap.merge(Map({
  unstyled: {
    element: 'p',
  },
}))

const options = {
  blockToHTML: (block) => {
    const style = {}

    const {
      textAlign,
      lineHeight,
    } = block.data

    if (textAlign && textAlign !== 'left') {
      style.textAlign = textAlign
    }

    if (lineHeight) {
      style.lineHeight = lineHeight
    }

    if (block.type === 'ordered-list-item') {
      return {
        element: <li />,
        nest: <ol style={style} />,
      }
    } else if (block.type === 'unordered-list-item') {
      return {
        element: <li />,
        nest: <ul style={style} />,
      }
    }

    const tag = blockRenderMap.get(block.type).element
    return React.createElement(tag, { style })

  },
  styleToHTML: (style) => {
    if (style.startsWith('COLOR_')) {
      return <span style={{ color: style.split('COLOR_')[1] }} />
    }
    if (style.startsWith('BG_')) {
      return <span style={{ backgroundColor: style.split('BG_')[1] }} />
    }
    if (style === 'BOLD') {
      return <b />
    }
    if (style === 'STRIKETHROUGH') {
      return <span style={{ textDecoration: 'line-through' }} />
    }
    if (style.startsWith('FONTSIZE_')) {
      return <span style={{ fontSize: Number(style.split('FONTSIZE_')[1]) }} />
    }
  },
  entityToHTML: (entity, originalText) => {
    if (entity.type === 'LINK') {
      return <a href={entity.data.href}>{originalText}</a>
    }
    return originalText
  },
}

/**
 * Delicately convert the given ContentState to HTML
 *
 * @param ContentState content
 * @return String
 */
export default function exportToHTML (content) {
  return convertToHTML(options)(content)
}
