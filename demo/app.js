import React, { Component } from 'react'
import { render } from 'react-dom'

import Overdraft from '../src/Overdraft'
import Control from './components/Control'
import PopupControl from './components/PopupControl'
import Usage from './Usage'

class App extends Component {

  state = {
    value: '<h1 style="text-align: right;color:#52C4C0">Title level 1</h1><p>Bacon <u>ipsum</u> dolor amet frankfurter bresaola corned <b>beef</b> shank andouille pig filet mignon pork belly kielbasa short ribs <u><b><em>hamburger <span style="text-decoration:line-through;">meatball</span></em></b></u> pork loin beef chicken. Sirloin chuck picanha, ham hock capicola beef cow biltong.</p><ol><li>First list item</li><li>Second list item</li><li><span style="color:white;"><span style="background-color:#f16b6b;">Third</span></span> list item</li></ol>',
    selection: {},
    showOutput: false,
    showResult: false,
  }

  componentDidMount () {
    this.editor.focus()
  }

  toggleOutput = e => {
    e.preventDefault()
    this.setState({ showOutput: !this.state.showOutput })
  }

  toggleResult = e => {
    e.preventDefault()
    this.setState({ showResult: !this.state.showResult })
  }

  render () {

    const {
      value,
      selection,
      showOutput,
      showResult,
    } = this.state

    return (
      <div className='demo-container'>

        <h1 className='flex-center demo-heading'>
          <div className='relative'>
            <span style={{ textDecoration: 'line-through' }}>{'o'}</span>
            {'ver'}
            <span style={{ fontStyle: 'italic' }}>{'draft'}</span>
            <span className='version'>{__VERSION__}</span>
          </div>
          <code className='select-text'>{'npm i overdraft'}</code>
          <a
            style={{ marginLeft: 'auto', fontSize: 16 }}
            target='_blank'
            rel='noopener noreferrer'
            href='https://github.com/meriadec/overdraft'
          >
            {'See on GitHub'}
          </a>
        </h1>

        <div className='demo-overdraft-controls'>
          <div className='demo-overdraft-controls-row'>
            <div className='demo-overdraft-controls-group'>
              <Control
                label='H1'
                active={selection.isH1}
                onPress={() => this.editor.setBlockType('header-one')}
              />
              <Control
                label='H2'
                active={selection.isH2}
                onPress={() => this.editor.setBlockType('header-two')}
              />
              <Control
                label='H3'
                active={selection.isH3}
                onPress={() => this.editor.setBlockType('header-three')}
              />
              <Control
                label='P'
                active={selection.isP}
                onPress={() => this.editor.setBlockType('unstyled')}
              />
              <Control
                active={selection.isListUnordered}
                onPress={() => this.editor.setBlockType('unordered-list-item')}
                label='UL'
              />
              <Control
                active={selection.isListOrdered}
                onPress={() => this.editor.setBlockType('ordered-list-item')}
                label='OL'
              />
            </div>
            <div className='demo-overdraft-controls-group'>
              <Control
                active={selection.isTextLeft}
                onPress={() => this.editor.alignBlock('left')}
                label='left'
              />

              <Control
                active={selection.isTextCenter}
                onPress={() => this.editor.alignBlock('center')}
                label='center'
              />

              <Control
                active={selection.isTextJustify}
                onPress={() => this.editor.alignBlock('justify')}
                label='justify'
              />

              <Control
                active={selection.isTextRight}
                onPress={() => this.editor.alignBlock('right')}
                label='right'
              />
            </div>
          </div>
          <div className='demo-overdraft-controls-row'>
            <div className='demo-overdraft-controls-group'>
              <Control
                label={<span style={{ fontWeight: 'bold' }}>{'B'}</span>}
                active={selection.isBold}
                onPress={() => this.editor.setBold()}
              />
              <Control
                active={selection.isItalic}
                onPress={() => this.editor.setItalic()}
                label='I'
                style={{ fontStyle: 'italic' }}
              />
              <Control
                active={selection.isLinethrough}
                onPress={() => this.editor.setStrikeThrough()}
                label='S'
                style={{ textDecoration: 'line-through' }}
              />
              <Control
                active={selection.isUnderline}
                onPress={() => this.editor.setUnderline()}
                style={{ textDecoration: 'underline' }}
                label='U'
              />
            </div>
            <div className='demo-overdraft-controls-group'>
              <PopupControl
                isNumber
                value={selection.fontSize}
                onChange={v => this.editor.setFontSize(v)}
                label='Font size'
              />
              <PopupControl
                isNumber
                value={selection.lineHeight}
                onChange={v => this.editor.setLineHeight(v)}
                label='Line height'
              />
              <PopupControl
                isColor
                value={selection.textColor}
                onChange={v => this.editor.setTextColor(v)}
                onRemove={() => this.editor.removeTextColor()}
                label={(
                  <span className='flex-center'>
                    {'Color'}
                    <span className='color' style={{ backgroundColor: selection.textColor }} />
                  </span>
                )}
              />
              <PopupControl
                isColor
                value={selection.textBg}
                onChange={v => this.editor.setTextBg(v)}
                onRemove={() => this.editor.removeTextBg()}
                label={(
                  <span className='flex-center'>
                    {'Background'}
                    <span className='color' style={{ backgroundColor: selection.textBg }} />
                  </span>
                )}
              />
            </div>
            <div className='demo-overdraft-controls-group'>
              <PopupControl
                isLink
                value={selection.link}
                onChange={href => this.editor.applyLink(href)}
                onRemove={() => this.editor.removeLink()}
                label='Link'
              />
            </div>
          </div>
        </div>

        <div className='demo-overdraft-container select-text'>
          <Overdraft
            ref={n => this.editor = n}
            value={value}
            onChange={value => this.setState({ value })}
            onSelectionChange={selection => this.setState({ selection })}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <a href='' onClick={this.toggleOutput}>
            {`${showOutput ? 'Hide' : 'Show'} output`}
          </a>
          <span className='arrow'>
            {!showOutput ? ' ▶' : ' ▼'}
          </span>
        </div>

        {showOutput && (
          <pre className='select-text'>{value}</pre>
        )}

        <div style={{ marginTop: 10 }}>
          <a href='' onClick={this.toggleResult}>
            {`${showResult ? 'Hide' : 'Show'} result`}
          </a>
          <span className='arrow'>
            {!showResult ? ' ▶' : ' ▼'}
          </span>
        </div>

        {showResult && (
          <div className='select-text' dangerouslySetInnerHTML={{ __html: value }} />
        )}

        <Usage />

      </div>
    )
  }

}

const root = document.getElementById('root')

render(<App />, root)
