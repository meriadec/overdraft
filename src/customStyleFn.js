export default function customStyleFn (style) {
  const styleNames = style.toJS()
  return styleNames.reduce((styles, styleName) => {
    if (styleName.startsWith('COLOR_')) {
      styles.color = styleName.split('COLOR_')[1]
    }
    if (styleName.startsWith('BG_')) {
      styles.backgroundColor = styleName.split('BG_')[1]
    }
    if (styleName.startsWith('FONTSIZE_')) {
      styles.fontSize = Number(styleName.split('FONTSIZE_')[1])
    }
    if (styleName.startsWith('LINE_HEIGHT_')) {
      styles.lineHeight = `${styleName.split('LINE_HEIGHT_')[1]}px`
    }
    return styles
  }, {})
}
