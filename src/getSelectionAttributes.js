import { Map } from 'immutable'
import {
  RichUtils,
} from 'draft-js'

import getSelectionKeys from './getSelectionKeys'

/**
 * Returns a friendly-usable recap of current selected styles,
 * eventually re-using the given selection attributes map
 *
 * @param EditorState state
 * @param Immutable.Map previous
 * @return Immutable.Map
 */
export default function getSelectionAttributes (state, previous = null) {

  if (!previous) { previous = Map() }

  const s = getSelectionKeys(state.getSelection())

  const blockData = state
    .getCurrentContent()
    .getIn(['blockMap', s.anchor, 'data'], null)

  let textAlign = 'left'
  let lineHeight = null

  if (blockData) {
    textAlign = blockData.get('textAlign')
    lineHeight = parseInt(blockData.get('lineHeight'), 10)
    if (Number.isNaN(lineHeight)) { lineHeight = null }
  }

  const blockType = RichUtils.getCurrentBlockType(state)
  const styles = state.getCurrentInlineStyle()

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
  }

  if (!attrs.isTextCenter && !attrs.isTextRight && !attrs.isTextJustify) {
    attrs.isTextLeft = true
  }

  return previous.merge(attrs)

}
