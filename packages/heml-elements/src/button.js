'use strict'

import { omit, pick } from 'lodash'
import { createElement, renderElement, utils } from 'heml' // eslint-disable-line no-unused-vars
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
  transition,
  box } = utils.cssGroups

export default createElement('button', {
  attrs: [ 'href', 'target' ],
  defaultAttrs: {
    href: '#'
  },

  rules: {
    '.button': [
      { '@pseudo': 'root' }, { display: utils.trueHide('block') } ],

    '.button__table': [
      { '@pseudo': 'table' }, margin, transition, table ],

    '.button__cell': [
      { '@pseudo': 'cell' }, background, transition, padding, borderRadius, border, height, width, box ],

    '.button__link': [
      { '@pseudo': 'link' }, background, text, font, transition ],
    '.button__text': [
      { '@pseudo': 'text' }, 'color', 'text-decoration', transition ]
  },

  render (attrs, contents) {
    return (
      <div {...omit(attrs, [ 'href', 'target', 'class' ])} class={[...attrs.class, 'button']}>
        <table role='presentation' width='100%' align='left' border='0' cellpadding='0' cellspacing='0'>
          <tr>
            <td>
              <table role='presentation' width='auto' align='center' border='0' cellspacing='0' cellpadding='0' class='button__table'>
                <tr>
                  <td align='center' class='button__cell'>
                    <a {...pick(attrs, [ 'href', 'target' ])} class='button__link'>
                      <span class='button__text'>{contents}</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <style for='button'>{`
        button {
          margin: auto;
          border-radius: 3px;
          padding: 6px 12px;
          background-color: #2097e4;
          color: #ffffff;
          text-decoration: none;
        }

        .button__link {
          display: inline-block;
        }
      `}</style>
      </div>)
  }
})
