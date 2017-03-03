import {
  ContentState,
  EditorState,
} from 'draft-js'

import getSelectionKeys from './getSelectionKeys'

export default function removeComplex (editorState, selectionState, prefix) {

  const s = getSelectionKeys(selectionState)

  const start = selectionState.getStartOffset()
  const end = selectionState.getEndOffset()

  const currentContent = editorState.getCurrentContent()

  // retrieve all blocks that we have selected
  let found = false
  const currentBlocks = currentContent.getBlockMap()
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
  const newContent = ContentState.createFromBlockArray(newBlocks.toArray())

  editorState = EditorState.createWithContent(newContent)
  editorState = EditorState.forceSelection(editorState, selectionState)

  return editorState

}
