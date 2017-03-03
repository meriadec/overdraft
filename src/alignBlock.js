import {
  Modifier,
  EditorState,
  SelectionState,
} from 'draft-js'

import getSelectionKeys from './getSelectionKeys'

export default function alignBlock (editorState, alignment) {

  const currentContent = editorState.getCurrentContent()
  const backupSelection = editorState.getSelection()
  const s = getSelectionKeys(backupSelection)
  const endBlock = currentContent.getBlockForKey(s.focus)
  const selectionState = SelectionState.createEmpty()

  const blocksSelection = selectionState.merge({
    anchorKey: s.anchor,
    anchorOffset: 0,
    focusKey: s.focus,
    focusOffset: endBlock.getText().length,
  })

  const styleName = `ALIGN_${alignment.toUpperCase()}`
  const alignments = ['ALIGN_LEFT', 'ALIGN_CENTER', 'ALIGN_JUSTIFY', 'ALIGN_RIGHT']

  let modified = alignments.reduce((content, styleName) => {
    return Modifier.removeInlineStyle(content, blocksSelection, styleName)
  }, currentContent)

  modified = Modifier.applyInlineStyle(modified, blocksSelection, styleName)
  editorState = EditorState.push(editorState, modified, 'change-alignment')
  editorState = EditorState.forceSelection(editorState, backupSelection)

  return editorState

}
