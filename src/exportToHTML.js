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
    const align = block.inlineStyleRanges.find(s => s.style.startsWith('ALIGN_'))
    const lineHeight = block.inlineStyleRanges.find(s => s.style.startsWith('LINE_HEIGHT_'))
    if (align) {
      const alignVal = align.style.split('_')[1].toLowerCase()
      if (alignVal !== 'left') {
        style.textAlign = alignVal
      }
    }
    if (lineHeight) {
      const lineHeightVal = lineHeight.style.split('_')[2].toLowerCase()
      style.lineHeight = `${lineHeightVal}px`
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
