/**
 * Converts all width properties on images to be a fixed value
 * when any given image has an ancestor with a fixed width
 * (fix for outlook)
 * @param  {Cheerio} $
 */
function fixImageWidths ($) {
  // get all relative widths and set them to fixed values by default
  $('img[width*="%"]').toNodes().forEach(($img) => {
    const imgWidth = $img.attr('width')
    /**
     * Gather all the parent percents and multiply them against
     * the image and fixed parent width
     */
    let parentPercent = 1

    $img.parents().toNodes().forEach(($el) => {
      const parentWidth = $el.attr('width')

      if (parentWidth && !parentWidth.endsWith('%')) {
        const currentStyles = $img.attr('style')

        $img.attr('style', setProp(currentStyles, 'width', imgWidth))
        $img.attr('width', parseFloat(parentWidth, 10) * parentPercent * parseFloat(imgWidth, 10) / 100)

        return false
      } else if (parentWidth && parentWidth.endsWith('%')) {
        parentPercent = parentPercent * parseFloat(parentWidth, 10) / 100
      }
    })
  })
}

/**
 * Sets the value of a prop in a given inline style string
 * @param {String} style inline styles
 * @param {String} prop  prop to update
 * @param {String} value new value
 *
 * @return {String} style
 */
function setProp (style, prop, value) {
  prop = prop.trim().toLowerCase()
  const decls = style.split(';')

  let updated = false

  const updatedDecls = decls.map((decl) => {
    if (decl.trim().toLowerCase().startsWith(`${prop}:`)) {
      updated = true
      return `${prop}: ${value}`
    }

    return decl
  })

  if (!updated) { updatedDecls.push(`${prop}: ${value}`) }

  return updatedDecls.join(';')
}

export default fixImageWidths
