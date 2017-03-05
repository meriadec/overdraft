import { Map } from 'immutable'
import {
  RichUtils,
} from 'draft-js'

import getSelectionKeys from './getSelectionKeys'

function getLinkHrefAtOffset (contentState, block, offset, tryBefore = true) {
  const linkEntityKey = block.getEntityAt(offset)
  if (linkEntityKey) {
    const linkEntity = contentState.getEntity(linkEntityKey)
    return linkEntity.getData().href
  }
  // here, we also check for the precedent characted,
  // because we want the link to be detected if the
  // cursor is at the end of the link
  return tryBefore
    ? getLinkHrefAtOffset(contentState, block, offset - 1, false)
    : null
}

/**
 * Returns a friendly-usable recap of current selected styles,
 * eventually re-using the given selection attributes map
 *
 * @param EditorState editorState
 * @param Immutable.Map previous
 * @return Immutable.Map
 */
export default function getSelectionAttributes (editorState, previous = null) {

  if (!previous) { previous = Map() }

  const selectionState = editorState.getSelection()
  const s = getSelectionKeys(selectionState)

  const contentState = editorState.getCurrentContent()

  const blockData = contentState
    .getIn(['blockMap', s.anchor, 'data'], null)

  let textAlign = 'left'
  let lineHeight = null

  if (blockData) {
    textAlign = blockData.get('textAlign')
    lineHeight = parseInt(blockData.get('lineHeight'), 10)
    if (Number.isNaN(lineHeight)) { lineHeight = null }
  }

  const currentBlock = contentState.getBlockForKey(s.anchor)
  const link = getLinkHrefAtOffset(contentState, currentBlock, s.startOffset)

  const blockType = RichUtils.getCurrentBlockType(editorState)
  const styles = editorState.getCurrentInlineStyle()

  const attrs = {
    isH1: blockType === 'header-one',
    isH2: blockType === 'header-two',
    isH3: blockType === 'header-three',
    isP: blockType === 'unstyled',
    isListUnordered: blockType === 'unordered-list-item',
    isListOrdered: blockType === 'ordered-list-item',
    isTextLeft: textAlign === 'left',
    isTextCenter: textAlign === 'center',
    isTextRight: textAlign === 'right',
    isTextJustify: textAlign === 'justify',
    isBold: styles.includes('BOLD'),
    isItalic: styles.includes('ITALIC'),
    isLinethrough: styles.includes('STRIKETHROUGH'),
    isUnderline: styles.includes('UNDERLINE'),

    fontSize: styles.reduce((fontSize, name) => {
      if (name.startsWith('FONTSIZE_')) {
        return name.split('FONTSIZE_')[1]
      }
      return fontSize
    }, null),

    lineHeight,

    textColor: styles.reduce((color, name) => {
      if (name.startsWith('COLOR_')) {
        return name.split('COLOR_')[1]
      }
      return color
    }, '#000000'),

    textBg: styles.reduce((color, name) => {
      if (name.startsWith('BG_')) {
        return name.split('BG_')[1]
      }
      return color
    }, 'transparent'),

    link,
  }

  if (!attrs.isTextCenter && !attrs.isTextRight && !attrs.isTextJustify) {
    attrs.isTextLeft = true
  }

  return previous.merge(attrs)

}
