/**
 * Adds the property this tranform is attached to, if the desired property wasn't given
 * @param  {String} prop
 * @return {Function}
 */
export default function fallbackFor (desiredProp) {
  return (prop, rule) => {
    let hasDesiredProp = false
    rule.walkDecls(desiredProp, () => { hasDesiredProp = true })

      /** remove the fallback property if we already have the desired properity */
    if (hasDesiredProp) {
      prop.remove()
    }
  }
}
