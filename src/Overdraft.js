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
import removeComplex from './removeComplex'
import setBlockComplex from './setBlockComplex'
import handlePaste from './handlePaste'

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

  edit = (editorState, focusAfter = true) => {
    this.setState({ editorState }, focusAfter ? this.focus : undefined)
    this.batchSelectionChange(editorState)
    this.batchOnChange(editorState)
  }

  editWithoutFocus = (editorState) => this.edit(editorState, false)

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

  handlePastedText = (text, html) => {
    if (!html) { return false }

    const { editorState } = this.state

    const pastedContent = importFromHTML(html)

    this.edit(handlePaste(editorState, pastedContent))

    return true
  }

  // -- RICH TEXT EDITING --

  toggleInline = styleName => this.edit(RichUtils.toggleInlineStyle(this.state.editorState, styleName), false)

  setBold = () => this.toggleInline('BOLD')
  setItalic = () => this.toggleInline('ITALIC')
  setStrikeThrough = () => this.toggleInline('STRIKETHROUGH')
  setUnderline = () => this.toggleInline('UNDERLINE')

  setBlockType = blockType => this.edit(RichUtils.toggleBlockType(this.state.editorState, blockType), false)

  setFontSize = (size) => this.setComplex('FONTSIZE', size)

  setComplex = (prefix, value) => {

    let { editorState } = this.state

    const selectionState = editorState.getSelection()
    editorState = removeComplex(editorState, selectionState, prefix)

    if (!value) { return this.edit(editorState) }

    this.edit(RichUtils.toggleInlineStyle(editorState, `${prefix}_${value}`))
  }

  setTextColor = color => this.setComplex('COLOR', color, true)
  setTextBg = color => this.setComplex('BG', color, true)
  removeTextColor = () => this.setComplex('COLOR', null, true)
  removeTextBg = () => this.setComplex('BG', null, true)

  setBlockComplex = (prefix, value) => this.edit(
    setBlockComplex(this.state.editorState, prefix, value),
  )

  setLineHeight = size => this.setBlockComplex('lineHeight', `${size}px`)
  alignBlock = alignment => this.setBlockComplex('textAlign', alignment)

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
        onChange={this.editWithoutFocus}
        blockStyleFn={blockStyleFn}
        customStyleFn={customStyleFn}
        handlePastedText={this.handlePastedText}
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
