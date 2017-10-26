import postcss from 'postcss'
import shorthandExpand from 'css-shorthand-expand'

export default postcss.plugin('postcss-expand-shorthand', () => (root) => {
  root.walkDecls((decl) => {
    if (shouldExpand(decl.prop) && !!decl.value) {
      const expandedDecls = shorthandExpand(decl.prop, decl.value)

      for (const [ prop, value ] of Object.entries(expandedDecls)) {
        decl.before(postcss.decl({ prop, value }))
      }

      decl.remove()
    }
  })
})

function shouldExpand (prop) {
  return ['background', 'font', 'margin'].includes(prop)
}
