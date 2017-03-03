import React, { Component } from 'react'
import { render } from 'react-dom'

import Overdraft from '../src/Overdraft'
import Control from './Control'

class App extends Component {

  state = {
    value: '<h1>Title level 1</h1><p>Paragraph that <b>is bold</b></p>',
    selection: {},
  }

  render () {

    const {
      value,
      selection,
    } = this.state

    return (
      <div className='demo-container'>

        <h1 className='flex-center'>
          {'overdraft'}
          <code className='select-text'>{'npm i overdraft'}</code>
        </h1>

        <p>
          {'Source on github: '}
          <a target='_blank' rel='noopener noreferrer' href='https://github.com/meriadec/overdraft'>
            {'https://github.com/meriadec/overdraft'}
          </a>
        </p>

        <div className='demo-overdraft-controls'>
          <div className='demo-overdraft-controls-row'>
            <div className='demo-overdraft-controls-group'>
              <Control
                label='H1'
                active={selection.isH1}
                onPress={() => this._editor.setBlockType('header-one')}
              />
              <Control
                label='H2'
                active={selection.isH2}
                onPress={() => this._editor.setBlockType('header-two')}
              />
              <Control
                label='H3'
                active={selection.isH3}
                onPress={() => this._editor.setBlockType('header-three')}
              />
              <Control
                label='P'
                active={selection.isP}
                onPress={() => this._editor.setBlockType('unstyled')}
              />
            </div>
            <div className='demo-overdraft-controls-group'>
              <Control
                active={selection.isListUnordered}
                onPress={() => this._editor.setBlockType('unordered-list-item')}
                label='UL'
              />
              <Control
                active={selection.isListOrdered}
                onPress={() => this._editor.setBlockType('ordered-list-item')}
                label='OL'
              />
            </div>
          </div>
          <div className='demo-overdraft-controls-row'>
            <div className='demo-overdraft-controls-group'>
              <Control
                label='B'
                active={selection.isBold}
                onPress={() => this._editor.setBold()}
              />
              <Control
                active={selection.isItalic}
                onPress={() => this._editor.setItalic()}
                label='I'
                style={{ fontStyle: 'italic' }}
              />
              <Control
                active={selection.isLinethrough}
                onPress={() => this._editor.setStrikeThrough()}
                label='S'
                style={{ textDecoration: 'line-through' }}
              />
              <Control
                active={selection.isUnderline}
                onPress={() => this._editor.setUnderline()}
                style={{ textDecoration: 'underline' }}
                label='U'
              />
            </div>
          </div>
        </div>

        <div className='demo-overdraft-container select-text'>
          <Overdraft
            ref={n => this._editor = n}
            value={value}
            onChange={value => this.setState({ value })}
            onSelectionChange={selection => this.setState({ selection })}
          />
        </div>

        <pre className='select-text'>{value}</pre>

      </div>
    )
  }

}

const root = document.getElementById('root')

render(<App />, root)
