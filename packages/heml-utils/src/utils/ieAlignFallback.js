/**
 * inline margin-left: auto; and margin-right: auto; otherwise, through it to 0
 */
export default function ieAlignFallback (decl) {
  if (decl.prop === 'margin-top' || decl.prop === 'margin-bottom') {
    return decl.remove()
  }

  if ((decl.prop === 'margin-left' || decl.prop === 'margin-right') && decl.value !== 'auto') {
    decl.value = '0'
  }
}
