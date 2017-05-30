import {
  EditorState,
} from 'draft-js'

import createDecorator from './createDecorator'
import getSelectionKeys from './getSelectionKeys'

export default function removeComplex (editorState, selectionState, prefix) {

  const s = getSelectionKeys(selectionState)

  const start = selectionState.getStartOffset()
  const end = selectionState.getEndOffset()

  let contentState = editorState.getCurrentContent()

  // retrieve all blocks that we have selected
  let found = false
  const currentBlocks = contentState.getBlockMap()
  const blocks = currentBlocks
    .skipUntil((v, k) => k === s.anchor)
    .takeUntil((v, k) => {
      if (found) { return true }
      if (k === s.focus) { found = true }
    })
    .map((v, k) => {
      const firstIndex = k === s.anchor ? start : -1
      const lastIndex = k === s.focus ? end : -1
      return v.set('characterList', v.get('characterList').map((v, i) => {
        if (firstIndex > -1 && i < firstIndex) { return v }
        if (lastIndex > -1 && i >= lastIndex) { return v }
        return v.set('style', v.get('style').filter(v => {
          return !v.startsWith(prefix)
        }))
      }))
    })

  const newBlocks = currentBlocks.merge(blocks)
  contentState = contentState.set('blockMap', newBlocks)

  editorState = EditorState.createWithContent(contentState, createDecorator())
  editorState = EditorState.acceptSelection(editorState, selectionState)

  return editorState

}
