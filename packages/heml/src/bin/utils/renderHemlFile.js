import { readFile } from 'fs-extra'
import heml from '../../'

async function renderHemlFile (filepath, options) {
  const contents = await readFile(filepath, 'utf8')
  const startTime = process.hrtime()
  const results = await heml(contents, options)
  results.metadata.time = Math.round(process.hrtime(startTime)[1] / 1000000)

  return results
}

export default renderHemlFile
