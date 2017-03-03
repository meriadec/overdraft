import React, { Component } from 'react'
import debounce from 'lodash/debounce'
import {
  Modifier,
  ContentState,
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

function getSelectionKeys (selection) {
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

class Overdraft extends Component {

  state = {
    editorState: null,
  }

  componentDidMount () {
    window.requestAnimationFrame(() => {

      const { value } = this.props

      const contentState = importFromHTML(value)
      const editorState = EditorState.createWithContent(contentState)

      this.setState({ editorState })

    })
  }

  edit = (editorState, focusAfter = false) => {
    this.setState({ editorState }, focusAfter ? this.focus : undefined)
    this.batchSelectionChange(editorState)
    this.batchOnChange(editorState)
  }

  focus = () => {
    if (!this._editor) { return }
    this._editor.focus()
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

  setBold = () => this.edit(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'))
  setItalic = () => this.edit(RichUtils.toggleInlineStyle(this.state.editorState, 'ITALIC'))
  setStrikeThrough = () => this.edit(RichUtils.toggleInlineStyle(this.state.editorState, 'STRIKETHROUGH'))
  setUnderline = () => this.edit(RichUtils.toggleInlineStyle(this.state.editorState, 'UNDERLINE'))
  setBlockType = blockType => this.edit(RichUtils.toggleBlockType(this.state.editorState, blockType))

  setFontSize = (size) => this.setComplex('FONTSIZE', size, true)

  setLineHeight = (size) => {

    let { editorState } = this.state

    const currentContent = editorState.getCurrentContent()

    const backupSelection = editorState.getSelection()
    const s = getSelectionKeys(backupSelection)

    const selectionState = SelectionState.createEmpty()
    const endBlock = currentContent.getBlockForKey(s.focus)
    const blocksSelection = selectionState.merge({
      anchorKey: s.anchor,
      anchorOffset: 0,
      focusKey: s.focus,
      focusOffset: endBlock.getText().length,
    })

    editorState = removeComplex(editorState, blocksSelection, 'LINE_HEIGHT')

    const styleName = `LINE_HEIGHT_${size}`
    let modified = Modifier.applyInlineStyle(currentContent, blocksSelection, styleName)

    editorState = EditorState.push(editorState, modified, 'change-line-height')

    // editorState = EditorState.forceSelection(editorState, blocksSelection)

    // const styles = editorState.getCurrentInlineStyle()

    // editorState = styles.reduce((state, styleKey) => {
    //   if (styleKey.startsWith(`${prefix}_`)) {
    //     return RichUtils.toggleInlineStyle(state, styleKey)
    //   }
    //   return state
    // }, editorState)

    editorState = EditorState.forceSelection(editorState, backupSelection)

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
  removeColor = () => this.setComplex('COLOR', null, true)
  removeBG = () => this.setComplex('BG', null, true)

  alignBlock = alignment => {

    let { editorState } = this.state

    const currentContent = editorState.getCurrentContent()
    const backupSelection = editorState.getSelection()
    const s = getSelectionKeys(backupSelection)
    const endBlock = currentContent.getBlockForKey(s.focus)
    const selectionState = SelectionState.createEmpty()

    const blocksSelection = selectionState.merge({
      anchorKey: s.anchor,
      anchorOffset: 0,
      focusKey: s.focus,
      focusOffset: endBlock.getText().length,
    })

    const styleName = `ALIGN_${alignment.toUpperCase()}`
    const alignments = ['ALIGN_LEFT', 'ALIGN_CENTER', 'ALIGN_JUSTIFY', 'ALIGN_RIGHT']

    let modified = alignments.reduce((content, styleName) => {
      return Modifier.removeInlineStyle(content, blocksSelection, styleName)
    }, currentContent)

    modified = Modifier.applyInlineStyle(modified, blocksSelection, styleName)
    editorState = EditorState.push(editorState, modified, 'change-alignment')
    editorState = EditorState.forceSelection(editorState, backupSelection)

    this.edit(editorState, true)

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

function removeComplex (editorState, selectionState, prefix) {

  const s = getSelectionKeys(selectionState)

  const start = selectionState.getStartOffset()
  const end = selectionState.getEndOffset()

  const currentContent = editorState.getCurrentContent()

  // retrieve all blocks that we have selected
  let found = false
  const currentBlocks = currentContent.getBlockMap()
  const blocks = currentBlocks
    .skipUntil((v, k) => k === s.anchor)
    .takeUntil((v, k) => {
      if (found) { return true }
      if (k === s.focus) { found = true }
    })
    .map((v, k) => {
      const firstIndex = k === s.anchor ? start : -1
      const lastIndex = k === s.focus ? end : -1
      return v.set('characterList', v.get('characterList').map((v, i) => {
        if (firstIndex > -1 && i < firstIndex) { return v }
        if (lastIndex > -1 && i >= lastIndex) { return v }
        return v.set('style', v.get('style').filter(v => {
          return !v.startsWith(prefix)
        }))
      }))
    })

  const newBlocks = currentBlocks.merge(blocks)
  const newContent = ContentState.createFromBlockArray(newBlocks.toArray())

  editorState = EditorState.createWithContent(newContent)
  editorState = EditorState.forceSelection(editorState, selectionState)

  return editorState

}
