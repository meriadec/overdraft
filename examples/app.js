import React, { Component } from 'react'
import { render } from 'react-dom'

import Overdraft from '../src/Overdraft'
import Control from './components/Control'
import PopupControl from './components/PopupControl'
import Usage from './Usage'

class App extends Component {

  state = {
    value: '<h1>Title level 1</h1><p>Paragraph that <b>is bold</b></p><ol><li>First list item</li><li>Second list item</li><li><span style="color:white;"><span style="background-color:#f16b6b;">Third</span></span> list item</li></ol>',
    selection: {},
    showOutput: false,
  }

  componentDidMount () {
    this.editor.focus()
  }

  render () {

    const {
      value,
      selection,
      showOutput,
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
            </div>
            <div className='demo-overdraft-controls-group'>
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
          </div>
          <div className='demo-overdraft-controls-row'>
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
                label='B'
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
              <PopupControl
                isNumber
                value={selection.fontSize}
                onChange={v => this.editor.setFontSize(v)}
                label='Font size'
              />
              <PopupControl
                isColor
                value={selection.textColor}
                onChange={v => this.editor.setTextColor(v)}
                onRemove={() => this.editor.removeTextColor()}
                label={(
                  <span className='flex-center'>
                    {'Text color'}
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
                    {'Text background'}
                    <span className='color' style={{ backgroundColor: selection.textBg }} />
                  </span>
                )}
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

        {showOutput && (
          <pre className='select-text'>{value}</pre>
        )}

        <Usage />

      </div>
    )
  }

}

const root = document.getElementById('root')

render(<App />, root)
