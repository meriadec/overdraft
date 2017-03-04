import {
  EditorState,
  SelectionState,
} from 'draft-js'

import getSelectionKeys from './getSelectionKeys'

export default function handlePaste (editorState, pastedContent) {

  const selectionState = editorState.getSelection()
  const s = getSelectionKeys(selectionState)
  const pastedBlocks = pastedContent.getBlockMap()
  const rawLastPasted = pastedBlocks.last()

  let currentContent = editorState.getCurrentContent()
  const currentBlocks = currentContent.getBlockMap()

  const beforeBlocks = currentBlocks
    .takeUntil(b => b.get('key') === s.anchor)

  const afterBlocks = currentBlocks
    .skipUntil(b => b.get('key') === s.focus)
    .slice(1)

  const blockAnchor = currentBlocks.get(s.anchor)
  const blockFocus = currentBlocks.get(s.focus)

  const firstPasted = pastedBlocks.first()
  const firstPastedType = firstPasted.get('type')

  let finalBlocks = beforeBlocks

  let meltedStart = blockAnchor
    .set('text', [
      blockAnchor.getText().substr(0, s.startOffset),
      firstPasted.getText(),
    ].join(''))
    .set('characterList', blockAnchor
      .get('characterList')
      .slice(0, s.startOffset)
      .concat(firstPasted.get('characterList'))
    )

  if (firstPastedType !== 'unstyled') {
    meltedStart = meltedStart.set('type', firstPastedType)
  }

  finalBlocks = finalBlocks.set(meltedStart.key, meltedStart)
  finalBlocks = finalBlocks.concat(pastedBlocks.slice(1))

  const lastPasted = finalBlocks.last()
  const lastPastedType = lastPasted.get('type')

  let meltedLast = lastPasted
    .set('text', [
      lastPasted.getText(),
      blockFocus.getText().substr(s.endOffset),
    ].join(''))
    .set('characterList', lastPasted
      .get('characterList')
      .concat(blockFocus.get('characterList').slice(s.endOffset))
    )

  if (lastPastedType !== 'unstyled') {
    meltedLast = meltedLast.set('type', lastPastedType)
  }

  finalBlocks = finalBlocks.set(lastPasted.key, meltedLast)
  finalBlocks = finalBlocks.concat(afterBlocks)

  currentContent = currentContent.set('blockMap', finalBlocks)

  editorState = EditorState.createWithContent(currentContent)

  const offset = pastedBlocks.size > 1
    ? rawLastPasted.getText().length
    : s.endOffset + rawLastPasted.getText().length

  const finalSelection = SelectionState
    .createEmpty(lastPasted.key)
    .merge({ anchorOffset: offset, focusOffset: offset })

  editorState = EditorState.forceSelection(editorState, finalSelection)

  return editorState

}
