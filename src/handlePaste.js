import {
  OrderedMap,
  List,
} from 'immutable'

import {
  EditorState,
  SelectionState,
} from 'draft-js'

import getSelectionKeys from './getSelectionKeys'

export default function handlePaste (editorState, pastedContent) {

  const selectionState = editorState.getSelection()
  const s = getSelectionKeys(selectionState)
  const pastedBlocks = pastedContent.getBlockMap()

  let currentContent = editorState.getCurrentContent()
  const currentBlocks = currentContent.getBlockMap()

  let foundStart = false
  let foundEnd = false
  let finalSelectionOffset
  let finalSelectionBlock

  const newBlocks = currentBlocks.reduce((blocks, block, key) => {

    if (key === s.anchor) {
      const firstPastedBlock = pastedBlocks.first()
      if (key === s.focus) {
        finalSelectionOffset = s.startOffset + firstPastedBlock.getText().length
        finalSelectionBlock = pastedBlocks.last().get('key')
        foundEnd = true
      }
      foundStart = true
      const meltedFirstBlock = block
        .set('type', firstPastedBlock.get('type'))
        .set('text', [
          block.getText().substr(0, s.startOffset),
          firstPastedBlock.getText(),
          foundEnd ? block.getText().substr(s.endOffset) : '',
        ].join(''))
        .set(
          'characterList',
          block.getCharacterList()
            .slice(0, s.startOffset)
            .concat(firstPastedBlock.getCharacterList())
            .concat(foundEnd ? block.getCharacterList().slice(s.endOffset) : List())
        )

      const finalBlocks = OrderedMap()
        .set(block.get('key'), meltedFirstBlock)
        .concat(pastedBlocks.skip(1))

      blocks = blocks.concat(finalBlocks)
      return blocks
    }

    if (key === s.focus) {
      foundEnd = true
      const lastPastedBlock = pastedBlocks.last()
      const lastBlock = blocks.last()
      const meltedLastBlock = lastBlock
        .set('type', lastPastedBlock.get('type'))
        .set('text', [
          lastBlock.getText(),
          block.getText().substr(s.endOffset),
        ].join(''))
        .set(
          'characterList',
          lastBlock.getCharacterList()
            .concat(block.getCharacterList().slice(s.endOffset))
        )

      finalSelectionBlock = lastBlock.get('key')
      finalSelectionOffset = s.startOffset + lastPastedBlock.getText().length
      blocks = blocks.set(lastBlock.get('key'), meltedLastBlock)
      return blocks
    }

    // push all blocks before and after selection
    if (!foundStart || foundEnd) {
      blocks = blocks.set(key, block)
    }

    return blocks

  }, OrderedMap())

  currentContent = currentContent.set('blockMap', newBlocks)

  editorState = EditorState.createWithContent(currentContent)

  const finalSelection = SelectionState
    .createEmpty(finalSelectionBlock)
    .merge({ anchorOffset: finalSelectionOffset, focusOffset: finalSelectionOffset })

  editorState = EditorState.forceSelection(editorState, finalSelection)

  return editorState

}
