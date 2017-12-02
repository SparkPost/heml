import HEML, { createElement, transforms, cssGroups } from '@heml/utils' // eslint-disable-line no-unused-vars
import { omit, pick } from 'lodash'

const {
  background,
  margin,
  padding,
  border,
  borderRadius,
  width,
  height,
  table,
  text,
  font,
  box } = cssGroups

export default createElement('button', {
  attrs: [ 'href', 'target' ],
  defaultAttrs: {
    href: '#'
  },

  rules: {
    '.button': [
      { '@pseudo': 'root' }, { display: transforms.trueHide('block') } ],

    '.button__table': [
      { '@pseudo': 'table' }, margin, table ],

    '.button__cell': [
      { '@pseudo': 'cell' }, background, padding, borderRadius, border, height, width, box ],

    '.button__link': [
      { '@pseudo': 'link' }, background, text, font ],
    '.button__text': [
      { '@pseudo': 'text' }, 'color', 'text-decoration' ]
  },

  css (Style) {
    return <Style>{`
      button {
        margin: auto;
        border-radius: 3px;
        padding: 6px 12px;
        background-color: #2097e4;
        color: #ffffff;
        text-decoration: none;
      }
    `}</Style>
  },

  render (attrs, contents) {
    attrs.class += ' button'

    return (
      <div {...omit(attrs, [ 'href', 'target' ])}>
        <table role='presentation' width='100%' align='left' border='0' cellpadding='0' cellspacing='0'>
          <tr>
            <td>
              <table role='presentation' width='auto' align='center' border='0' cellspacing='0' cellpadding='0' class='button__table'>
                <tr>
                  <td align='center' class='button__cell'>
                    <a {...pick(attrs, [ 'href', 'target' ])} class='button__link' style='display: inline-block;'>
                      <span class='button__text'>{contents}</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>)
  }
})
