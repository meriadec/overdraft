function getBlockAlignment (block) {
  let style = 'ALIGN_LEFT'
  block.findStyleRanges(e => {
    if (e.hasStyle('ALIGN_CENTER')) { style = 'ALIGN_CENTER' }
    if (e.hasStyle('ALIGN_RIGHT')) { style = 'ALIGN_RIGHT' }
    if (e.hasStyle('ALIGN_JUSTIFY')) { style = 'ALIGN_JUSTIFY' }
  })
  return style
}

export default function blockStyleFn (block) {
  return `alignment--${getBlockAlignment(block)} block-${block.get('type')}`
}
