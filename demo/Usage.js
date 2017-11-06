import React, { Component } from 'react'

class Usage extends Component {
  render() {
    return (
      <div style={{ marginTop: 100 }}>
        <h3 className="demo-h3">{'Usage'}</h3>

        <h4>{'Basic'}</h4>
        <pre>
          {`<Overdraft
  value={value}
  onChange={value => console.log(\`changed to \${value}\`)}
/>`}
        </pre>

        <h4>{'Get current selection state'}</h4>
        <pre>
          {`<Overdraft
  value={value}
  onChange={value => console.log(\`changed to \${value}\`)}
  onSelectionChange={selection => {
    console.log(selection)
  }}
/>`}
        </pre>
      </div>
    )
  }
}

export default Usage
