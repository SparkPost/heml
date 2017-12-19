import HEML, { createElement, transforms, cssGroups } from '@heml/utils' // eslint-disable-line no-unused-vars
import Preview from './Preview'

const {
  background,
  padding,
  font,
  text } = cssGroups

export default createElement('body', {
  unique: true,
  parent: [ 'heml' ],
  containsText: true,

  rules: {
    root: [ background ],
    table: [ '@default', background ],
    content: [ padding, font, text ]
  },

  css (Style) {
    return <Style>{`
      body {
        margin: 0;
        width: 100%;
        font-family: Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 20px;
        color: black;
      }
    `}</Style>
  },

  async render (attrs, contents) {
    const { rules, ...defaultAttrs } = attrs

    return (
      <body {...defaultAttrs} {...rules.root} style='margin: 0; width: 100%;'>
        {Preview.flush()}
        <table {...rules.table} role='presentation' width='100%' align='left' border='0' cellpadding='0' cellspacing='0' style='margin: 0;'>
          <tr>
            <td {...rules.content} align='left' width='100%' valign='top'>{contents}</td>
          </tr>
        </table>
        <div style='display:none; white-space:nowrap; font-size:15px; line-height:0;'>{'&nbsp; '.repeat(30)}</div>
      </body>)
  }
})
