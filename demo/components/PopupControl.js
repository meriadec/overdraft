import React, { Component } from 'react'
import { ChromePicker } from 'react-color'

import Control from './Control'
import Input from './Input'

class PopupControl extends Component {

  state = {
    isOpened: false,
    color: '#000000',
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.isColor && nextProps.value !== this.state.color) {
      this.setState({ color: nextProps.value })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.isOpened && !prevState.isOpened) {
      document.addEventListener('mousedown', this.closeOutside)
    } else if (!this.state.isOpened && prevState.isOpened) {
      document.removeEventListener('mousedown', this.closeOutside)
    }
  }

  componentWillUnmount () {
    document.removeEventListener('mousedown', this.closeOutside)
  }

  closeOutside = e => {
    if (!this._node.contains(e.target)) {
      this.close()
    }
  }

  close = () => this.setState({ isOpened: false })

  handleKeyDown = e => {
    e.stopPropagation()
    if (e.which === 13) {
      e.preventDefault()
      this.handleValidate()
    }
  }

  handleColorChange = c => this.setState({ color: c.hex })

  handleValidate = () => {

    const {
      isNumber,
      isColor,
      isLink,
      onChange,
    } = this.props

    if (isNumber) {
      onChange(Number(this._input.value))
    } else if (isColor) {
      onChange(this.state.color)
    } else if (isLink) {
      onChange(this._linkInput.value)
    }

    this.close()
  }

  handleRemove = () => {
    this.props.onRemove()
    this.close()
  }

  render () {

    const {
      label,
      isNumber,
      isColor,
      isLink,
      value,
    } = this.props

    const {
      isOpened,
      color,
    } = this.state

    return (
      <div className='PopupControl' ref={n => this._node = n}>
        <Control
          onPress={() => this.setState({ isOpened: !isOpened })}
          active={isOpened}
          label={isLink ? (
            <span style={{ color: (value !== null && !isOpened) ? '#f16b6b' : '#fff' }}>
              {label}
            </span>
          ) : label}
        />
        {isOpened && (
          <div className='PopupControl--popup'>
            {isNumber ? (
              <div className='flex-center'>
                <Input
                  type='number'
                  autoFocus
                  value={value || 8}
                  min={8}
                  max={100}
                  step={1}
                  onChange={v => this.props.onChange(Number(v))}
                />
                <button
                  className='demo-overdraft-control'
                  style={{ marginLeft: 5 }}
                  onClick={this.close}
                >
                  {'OK'}
                </button>
              </div>
            ) : isColor ? (
              <div>
                <ChromePicker
                  color={color}
                  onChangeComplete={this.handleColorChange}
                />
                <div style={{ marginTop: 5 }}>
                  <button
                    className='demo-overdraft-control'
                    onClick={this.handleValidate}
                  >
                    {'OK'}
                  </button>
                  <button
                    className='demo-overdraft-control'
                    style={{ marginLeft: 5 }}
                    onClick={this.handleRemove}
                  >
                    {'REMOVE'}
                  </button>
                </div>
              </div>
            ) : isLink ? (
              <div className='flex-center'>
                <input
                  autoFocus
                  type='text'
                  defaultValue={value || ''}
                  onKeyDown={this.handleKeyDown}
                  ref={n => this._linkInput = n}
                />
                <button
                  className='demo-overdraft-control'
                  style={{ marginLeft: 5 }}
                  onClick={this.handleValidate}
                >
                  {'APPLY'}
                </button>
                <button
                  className='demo-overdraft-control'
                  style={{ marginLeft: 5 }}
                  onClick={this.handleRemove}
                >
                  {'REMOVE'}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    )
  }

}

export default PopupControl
