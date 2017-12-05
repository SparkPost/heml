import HEML, { createElement, transforms } from '@heml/utils' // eslint-disable-line no-unused-vars
import { sum, max, isUndefined } from 'lodash'

export default createElement('row', {
  children: [ 'column' ],

  rules: {
    root: [ { display: transforms.trueHide('block') } ],
    table: [ ],
    row: [ ]
  },

  render (attrs, contents) {
    const { rules, ...defaultAttrs } = attrs

    return (
      <div {...defaultAttrs} {...rules.root}>
        <table {...rules.table} width='100%' align='center' role='presentation' border='0' cellpadding='0' cellspacing='0' style='table-layout: fixed;'>
          <tr {...rules.row}>{contents}</tr>
        </table>
      </div>)
  },

  preRender ({ $ }) {
    $.findNodes('row').forEach(($row) => {
      const $columns = $row.children().toNodes()
      const columnSizes = $columns.map(($column) => parseInt($column.attr('large') || 0, 10))
      const remainingSpace = 12 - sum(columnSizes)
      const remainingColumns = columnSizes.filter((size) => size === 0).length
      const spacePerColumn = max([Math.floor(remainingSpace / remainingColumns), 1])
      const overageSpace = remainingSpace - spacePerColumn * remainingColumns

      let filledColumns = 0
      $columns.forEach(($column) => {
        if (isUndefined($column.attr('large'))) {
          filledColumns++
          $column.attr('large', spacePerColumn + (filledColumns === remainingColumns ? overageSpace : 0))
        }
      })

      // if they don't add up to 12
      // and there are no specified columns
      if (remainingColumns === 0 && remainingSpace > 0) {
        $row.append('<td class="column-filler" style="padding: 0; mso-hide: all; max-height: 0px; overflow: hidden;"></td>')
      }
    })
  }
})
