import { convertFromHTML } from 'draft-convert'

const options = {

  htmlToStyle: (nodeName, node, currentStyle) => {

    if (node.style === null) { return currentStyle }

    const textColor = getHexColor(node.style.color)
    if (textColor) { return currentStyle.add(`COLOR_${textColor}`) }

    const textBg = getHexColor(node.style.backgroundColor)
    if (textBg) { return currentStyle.add(`BG_${textBg}`) }

    return currentStyle

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
