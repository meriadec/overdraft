export default function getSelectionKeys(selection) {
  if (selection.getIsBackward()) {
    return {
      anchor: selection.getFocusKey(),
      focus: selection.getAnchorKey(),
      startOffset: selection.getStartOffset(),
      endOffset: selection.getEndOffset(),
    }
  }
  return {
    anchor: selection.getAnchorKey(),
    focus: selection.getFocusKey(),
    startOffset: selection.getStartOffset(),
    endOffset: selection.getEndOffset(),
  }
}
