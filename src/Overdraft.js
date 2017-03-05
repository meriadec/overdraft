import React, { Component, PropTypes } from 'react'
import debounce from 'lodash.debounce'
import {
  Editor,
  EditorState,
  RichUtils,
} from 'draft-js'

import importFromHTML from './importFromHTML'
import exportToHTML from './exportToHTML'
import blockStyleFn from './blockStyleFn'
import customStyleFn from './customStyleFn'
import getSelectionAttributes from './getSelectionAttributes'
import removeComplex from './removeComplex'
import setBlockComplex from './setBlockComplex'
import handlePaste from './handlePaste'
import createDecorator from './createDecorator'

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
    const decorator = createDecorator()
    let editorState = EditorState.createWithContent(contentState, decorator)
    editorState = this.focusEnd(editorState)
    this.setState({ editorState })
    this.batchSelectionChange(editorState)
  }

  focusEnd = editorState => EditorState.moveFocusToEnd(editorState)

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

  setComplex = (prefix, value) => {

    let { editorState } = this.state

    const selectionState = editorState.getSelection()
    editorState = removeComplex(editorState, selectionState, prefix)

    if (!value) { return this.edit(editorState) }

    this.edit(RichUtils.toggleInlineStyle(editorState, `${prefix}_${value}`))
  }

  setFontSize = (size) => this.setComplex('FONTSIZE', size)
  setTextColor = color => this.setComplex('COLOR', color, true)
  setTextBg = color => this.setComplex('BG', color, true)
  removeTextColor = () => this.setComplex('COLOR', null, true)
  removeTextBg = () => this.setComplex('BG', null, true)

  setBlockComplex = (prefix, value) => this.edit(
    setBlockComplex(this.state.editorState, prefix, value),
  )

  setLineHeight = size => this.setBlockComplex('lineHeight', `${size}px`)
  alignBlock = alignment => this.setBlockComplex('textAlign', alignment)

  applyLink = href => {
    let { editorState } = this.state
    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { href })
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    editorState = EditorState.set(editorState, { currentContent: contentStateWithEntity })
    this.edit(RichUtils.toggleLink(editorState, editorState.getSelection(), entityKey))
  }

  removeLink = () => {
    const { editorState } = this.state
    const selection = editorState.getSelection()
    if (!selection.isCollapsed()) {
      this.edit(RichUtils.toggleLink(editorState, selection, null))
    }
  }

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
