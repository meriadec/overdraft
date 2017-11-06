import React, { Component } from 'react'

class Input extends Component {
  state = {
    value: this.props.value,
  }

  handleChange = e => {
    const { value } = e.target
    this.setState({ value })
    this.props.onChange(value)
  }

  handleKeyDown = e => {
    if (e.which === 13) {
      e.stopPropagation()
      e.preventDefault()
      this.props.onSubmit()
    }
  }

  render() {
    const { value } = this.state

    const {
      value: v, // eslint-disable-line
      onChange, // eslint-disable-line
      ...props
    } = this.props

    return (
      <input value={value} onChange={this.handleChange} onKeyDown={this.handleKeyDown} {...props} />
    )
  }
}

export default Input
