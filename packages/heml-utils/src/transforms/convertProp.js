/**
 * convert a decleration to different properity
 * .i.e. max-width -> width
 * @param  {String} prop
 * @return {Function}
 */
export default function convertProp (prop) {
  return (decl) => { decl.prop = prop }
}
