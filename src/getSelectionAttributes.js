import { Map } from 'immutable'
import {
  RichUtils,
} from 'draft-js'

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

  const blockType = RichUtils.getCurrentBlockType(state)
  const styles = state.getCurrentInlineStyle()

  const s = {
    isH1: blockType === 'header-one',
    isH2: blockType === 'header-two',
    isH3: blockType === 'header-three',
    isP: blockType === 'unstyled',
    isListUnordered: blockType === 'unordered-list-item',
    isListOrdered: blockType === 'ordered-list-item',
    isTextLeft: styles.includes('ALIGN_LEFT'),
    isTextCenter: styles.includes('ALIGN_CENTER'),
    isTextRight: styles.includes('ALIGN_RIGHT'),
    isTextJustify: styles.includes('ALIGN_JUSTIFY'),
    isBold: styles.includes('BOLD'),
    isItalic: styles.includes('ITALIC'),
    isLinethrough: styles.includes('STRIKETHROUGH'),
    isUnderline: styles.includes('UNDERLINE'),

    fontSize: styles.reduce((fontSize, name) => {
      if (name.startsWith('FONT_SIZE_')) {
        return name.split('FONT_SIZE_')[1]
      }
      return fontSize
    }, 13),

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

  if (!s.isTextCenter && !s.isTextRight && !s.isTextJustify) {
    s.isTextLeft = true
  }

  return previous.merge(s)

}
