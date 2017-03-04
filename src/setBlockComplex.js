import {
  EditorState,
} from 'draft-js'

import getSelectionKeys from './getSelectionKeys'

export default function setBlockComplex (editorState, prop, value) {

  const backupSelection = editorState.getSelection()
  const s = getSelectionKeys(backupSelection)
  let currentContent = editorState.getCurrentContent()
  const currentBlocks = currentContent.getBlockMap()

  let found = false
  const blocks = currentBlocks
    .skipUntil((v, k) => k === s.anchor)
    .takeUntil((v, k) => {
      if (found) { return true }
      if (k === s.focus) { found = true }
    })
    .map(block => block.setIn(['data', prop], value))

  currentContent = currentContent.set('blockMap', currentBlocks.merge(blocks))

  editorState = EditorState.createWithContent(currentContent)
  editorState = EditorState.forceSelection(editorState, backupSelection)

  // let currentContent = editorState.getCurrentContent()

  // const backupSelection = editorState.getSelection()
  // const s = getSelectionKeys(backupSelection)

  // const selectionState = SelectionState.createEmpty()
  // const endBlock = currentContent.getBlockForKey(s.focus)
  // const blocksSelection = selectionState.merge({
  //   anchorKey: s.anchor,
  //   anchorOffset: 0,
  //   focusKey: s.focus,
  //   focusOffset: endBlock.getText().length,
  // })

  // editorState = removeComplex(editorState, blocksSelection, prefix)
  // currentContent = editorState.getCurrentContent()

  // const styleName = `${prefix}_${value}`
  // const modified = Modifier.applyInlineStyle(currentContent, blocksSelection, styleName)

  // currentContent = currentContent.merge(modified)

  // editorState = EditorState.createWithContent(currentContent)
  // editorState = EditorState.forceSelection(editorState, backupSelection)

  return editorState

}
