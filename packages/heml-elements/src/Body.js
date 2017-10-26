import HEML, { createElement, transforms, cssGroups } from '@heml/utils' // eslint-disable-line no-unused-vars
import Style from './Style'
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
    '.body': [ { '@pseudo': 'root' }, background ],

    '.bodyTable': [ { '@pseudo': 'table' }, '@default', background ],

    '.body__content': [ { '@pseudo': 'content' }, padding, font, text ],

    '.preview': [ { 'background-color': transforms.convertProp('color') } ]
  },

  async render (attrs, contents) {
    attrs.class += ' body'

    return (
      <body {...attrs} style='margin: 0; width: 100%;'>
        {Preview.flush()}
        <table class='bodyTable' role='presentation' width='100%' align='left' border='0' cellpadding='0' cellspacing='0' style='margin: 0;'>
          <tr>
            <td class='body__content' align='left' width='100%' valign='top'>{contents}</td>
          </tr>
        </table>
        <div style='display:none; white-space:nowrap; font-size:15px; line-height:0;'>{'&nbsp; '.repeat(30)}</div>
        <Style for='body'>{`
          body {
            margin: 0;
            width: 100%;
            font-family: Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 20px;
            color: black;
          }
      `}</Style>
      </body>)
  }
})
