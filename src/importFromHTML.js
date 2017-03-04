import { convertFromHTML } from 'draft-convert'

const blocksTags = {
  h1: 'header-one',
  h2: 'header-two',
  h3: 'header-three',
  p: 'unstyled',
  div: 'unstyled',
}

const options = {

  htmlToStyle: (nodeName, node, currentStyle) => {

    if (node.style === null) { return currentStyle }

    const textColor = getHexColor(node.style.color)
    if (textColor) { currentStyle = currentStyle.add(`COLOR_${textColor}`) }

    const textBg = getHexColor(node.style.backgroundColor)
    if (textBg) { currentStyle = currentStyle.add(`BG_${textBg}`) }

    return currentStyle

  },

  htmlToBlock: (nodeName, node) => {
    const blockType = blocksTags[nodeName]
    if (blockType) {
      const data = {}
      if (node.style) {
        if (node.style.textAlign) {
          data.textAlign = node.style.textAlign
        }
      }
      return {
        type: blockType,
        data,
      }
    }
  },

}

function toHex (n) {
  const h = n.toString(16)
  return h.length === 1 ? `0${h}` : h
}

function getHexColor (c) {
  if (!c || typeof c !== 'string') { return null }
  if (c.startsWith('#')) { return c }
  if (!c.startsWith('rgb')) { return c }

  const r = (/rgba?\(([^)]*)\)/).exec(c)
  if (!r) { return null }
  const v = r[1].split(',').map(Number).map(toHex).join('')
  return `#${v}`
}

/**
 * Delicately convert the given HTML to a ContentState
 *
 * @param String html
 * @return ContentState
 */
export default function importFromHTML (html = '') {
  return convertFromHTML(options)(html)
}
