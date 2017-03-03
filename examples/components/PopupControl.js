import React, { Component } from 'react'

import Control from './Control'

class PopupControl extends Component {

  state = {
    isOpened: false,
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.isOpened && !prevState.isOpened) {
      document.addEventListener('click', this.closeOutside)
    } else if (!this.state.isOpened && prevState.isOpened) {
      document.removeEventListener('click', this.closeOutside)
    }
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.closeOutside)
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

  handleValidate = () => {

    const {
      isNumber,
      onChange,
    } = this.props

    if (isNumber) {
      onChange(Number(this._input.value))
      this.close()
    }
  }

  render () {

    const {
      label,
      isNumber,
      value,
    } = this.props

    const {
      isOpened,
    } = this.state

    return (
      <div className='PopupControl' ref={n => this._node = n}>
        <Control
          onPress={() => this.setState({ isOpened: !isOpened })}
          active={isOpened}
          label={label}
        />
        {isOpened && (
          <div className='PopupControl--popup'>
            {isNumber ? (
              <div className='flex-center'>
                <input
                  ref={n => this._input = n}
                  type='number'
                  autoFocus
                  defaultValue={value}
                  min={8}
                  max={100}
                  step={1}
                  onKeyDown={this.handleKeyDown}
                />
                <button
                  className='demo-overdraft-control'
                  style={{ marginLeft: 5 }}
                  onClick={this.handleValidate}
                >
                  {'OK'}
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
