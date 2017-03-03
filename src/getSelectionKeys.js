export default function getSelectionKeys (selection) {
  if (selection.getIsBackward()) {
    return {
      anchor: selection.getFocusKey(),
      focus: selection.getAnchorKey(),
    }
  }
  return {
    anchor: selection.getAnchorKey(),
    focus: selection.getFocusKey(),
  }
}
