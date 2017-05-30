import {
  EditorState,
} from 'draft-js'

import getSelectionKeys from './getSelectionKeys'
import createDecorator from './createDecorator'

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

  editorState = EditorState.createWithContent(currentContent, createDecorator())
  editorState = EditorState.acceptSelection(editorState, backupSelection)

  return editorState

}
