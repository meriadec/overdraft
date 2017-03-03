import React, { Component, PropTypes } from 'react'
import debounce from 'lodash/debounce'
import {
  Editor,
  EditorState,
  RichUtils,
  SelectionState,
} from 'draft-js'

import importFromHTML from './importFromHTML'
import exportToHTML from './exportToHTML'
import blockStyleFn from './blockStyleFn'
import customStyleFn from './customStyleFn'
import getSelectionAttributes from './getSelectionAttributes'
import alignBlock from './alignBlock'
import removeComplex from './removeComplex'

class Overdraft extends Component {

  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onSelectionChange: PropTypes.func,
    preventSSR: PropTypes.bool,
  }

  state = {
    editorState: null,
  }

  componentWillMount () {
    if (!this.props.preventSSR) {
      this.loadHTML(this.props.value)
    }
  }

  componentDidMount () {
    if (this.props.preventSSR) {
      window.requestAnimationFrame(() => this.loadHTML(this.props.value))
    }
  }

  loadHTML = value => {
    const contentState = importFromHTML(value)
    let editorState = EditorState.createWithContent(contentState)
    editorState = this.focusEnd(editorState)
    this.setState({ editorState })
    this.batchSelectionChange(editorState)
  }

  focusEnd = editorState => {
    const contentState = editorState.getCurrentContent()
    const blockMap = contentState.getBlockMap()
    const lastBlockKey = blockMap.findLastKey(() => true)
    const lastBlock = blockMap.last()
    const lastBlockLength = lastBlock.getText().length
    const selectionState = SelectionState
      .createEmpty(lastBlockKey)
      .merge({ anchorOffset: lastBlockLength, focusOffset: lastBlockLength })
    return EditorState.forceSelection(editorState, selectionState)
  }

  focus = () => this._editor.focus()

  // -- HANDLE MODIFICATIONS --

  edit = (editorState, focusAfter = false) => {
    this.setState({ editorState }, focusAfter ? this.focus : undefined)
    this.batchSelectionChange(editorState)
    this.batchOnChange(editorState)
  }

  batchOnChange = debounce(editorState => {
    const content = editorState.getCurrentContent()
    if (content !== this._lastContent) {
      this._lastContent = content
      const html = exportToHTML(content)
      this.props.onChange(html)
    }
  }, 100)

  batchSelectionChange = debounce(editorState => {
    const s = getSelectionAttributes(editorState, this._lastSelectionAttributes)
    if (s !== this._lastSelectionAttributes) {
      this._lastSelectionAttributes = s
      this.props.onSelectionChange(s.toJS())
    }
  }, 25)

  // -- RICH TEXT EDITING --

  toggleInline = styleName => this.edit(
    RichUtils.toggleInlineStyle(this.state.editorState, styleName)
  )

  setBold = () => this.toggleInline('BOLD')
  setItalic = () => this.toggleInline('ITALIC')
  setStrikeThrough = () => this.toggleInline('STRIKETHROUGH')
  setUnderline = () => this.toggleInline('UNDERLINE')

  setBlockType = blockType => this.edit(
    RichUtils.toggleBlockType(this.state.editorState, blockType)
  )

  setFontSize = (size) => this.setComplex('FONTSIZE', size)

  setLineHeight = (size) => {

    const { editorState } = this.state

    console.log(`setting line height to ${size} (not implemented)`) // eslint-disable-line

    // const currentContent = editorState.getCurrentContent()

    // const backupSelection = editorState.getSelection()
    // const s = getSelectionKeys(backupSelection)

    // const selectionState = SelectionState.createEmpty()
    // const endBlock = currentContent.getBlockForKey(s.focus)
    // const blocksSelection = selectionState.merge({
    //   anchorKey: s.anchor,
    //   anchorOffset: 0,
    //   focusKey: s.focus,
    //   focusOffset: endBlock.getText().length,
    // })

    // editorState = removeComplex(editorState, blocksSelection, 'LINE_HEIGHT')

    // const styleName = `LINE_HEIGHT_${size}`
    // let modified = Modifier.applyInlineStyle(currentContent, blocksSelection, styleName)

    // editorState = EditorState.push(editorState, modified, 'change-line-height')

    // editorState = EditorState.forceSelection(editorState, blocksSelection)

    // const styles = editorState.getCurrentInlineStyle()

    // editorState = styles.reduce((state, styleKey) => {
    //   if (styleKey.startsWith(`${prefix}_`)) {
    //     return RichUtils.toggleInlineStyle(state, styleKey)
    //   }
    //   return state
    // }, editorState)

    // editorState = EditorState.forceSelection(editorState, backupSelection)

    this.edit(editorState, true)

  }

  setComplex = (prefix, value, focusAfter = false) => {

    let { editorState } = this.state

    const selectionState = editorState.getSelection()
    editorState = removeComplex(editorState, selectionState, prefix)

    if (!value) {
      return this.edit(editorState)
    }

    this.edit(RichUtils.toggleInlineStyle(editorState, `${prefix}_${value}`), focusAfter)
  }

  setTextColor = color => this.setComplex('COLOR', color, true)
  setTextBg = color => this.setComplex('BG', color, true)
  removeTextColor = () => this.setComplex('COLOR', null, true)
  removeTextBg = () => this.setComplex('BG', null, true)

  alignBlock = alignment => this.edit(alignBlock(this.state.editorState, alignment))

  render () {

    const {
      editorState,
    } = this.state

    const {
      value,
    } = this.props

    return editorState ? (
      <Editor
        ref={n => this._editor = n}
        placeholder='Insert content here...'
        editorState={this.state.editorState}
        onChange={this.edit}
        blockStyleFn={blockStyleFn}
        customStyleFn={customStyleFn}
      />
    ) : (
      <div
        dangerouslySetInnerHTML={{
          __html: value,
        }}
      />
    )
  }

}

export default Overdraft
