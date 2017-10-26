import { setProp, getProp, removeProp } from './styleHelper'

export default function preferMaxWidth ($, selector) {
  $(selector).toNodes().forEach(($node) => {
    const maxWidth = getProp($node.attr('style'), 'max-width')
    const width = $node.attr('width') || ''

    if (!maxWidth) { return }

    const maxWidthIsPxValue = maxWidth && maxWidth.endsWith('px')

    const maxWidthIsSmallerThenWidth = maxWidth.endsWith('%') && width.endsWith('%') && (parseInt(maxWidth, 10) < parseInt(width, 10))

    if (maxWidthIsPxValue || maxWidthIsSmallerThenWidth) {
      let styles = removeProp($node.attr('style'), 'max-width')
      styles = removeProp(styles, 'width')

      $node.attr('width', maxWidth.replace('px', ''))
      $node.attr('style', setProp(styles, 'width', maxWidth))
    }
  })
}
