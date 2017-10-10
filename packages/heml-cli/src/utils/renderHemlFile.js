import { readFile } from 'fs-extra'
import heml from 'heml'

async function renderHemlFile (filepath, options) {
  const contents = await readFile(filepath, 'utf8')
  return heml(contents, options)
}

export default renderHemlFile
