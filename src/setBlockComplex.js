import {
  Modifier,
  EditorState,
  SelectionState,
} from 'draft-js'

import getSelectionKeys from './getSelectionKeys'
import removeComplex from './removeComplex'

export default function setBlockComplex (editorState, prefix, value) {

  let currentContent = editorState.getCurrentContent()

  const backupSelection = editorState.getSelection()
  const s = getSelectionKeys(backupSelection)

  const selectionState = SelectionState.createEmpty()
  const endBlock = currentContent.getBlockForKey(s.focus)
  const blocksSelection = selectionState.merge({
    anchorKey: s.anchor,
    anchorOffset: 0,
    focusKey: s.focus,
    focusOffset: endBlock.getText().length,
  })

  editorState = removeComplex(editorState, blocksSelection, prefix)
  currentContent = editorState.getCurrentContent()

  const styleName = `${prefix}_${value}`
  const modified = Modifier.applyInlineStyle(currentContent, blocksSelection, styleName)

  currentContent = currentContent.merge(modified)

  editorState = EditorState.createWithContent(currentContent)
  editorState = EditorState.forceSelection(editorState, backupSelection)

  return editorState

}