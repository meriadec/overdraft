function getBlockAlignment (block) {
  let style = 'ALIGN_LEFT'
  const textAlign = block.getIn(['data', 'textAlign'])
  if (textAlign) {
    style = `ALIGN_${textAlign.toUpperCase()}`
  }
  return style
}

export default function blockStyleFn (block) {
  return `alignment--${getBlockAlignment(block)} block-${block.get('type')}`
}
