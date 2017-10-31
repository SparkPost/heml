import path from 'path'
import { writeFile } from 'fs-extra'
import chalk, { red as error, yellow as code, blue, dim } from 'chalk'
import isHemlFile from '../utils/isHemlFile'
import renderHemlFile from '../utils/renderHemlFile'

const errorBlock = chalk.bgRed.black
const successBlock = chalk.bgGreen.black
const { log } = console

export default async function build (file, options) {
  const filepath = path.resolve(file)
  const outputpath = path.resolve(options.output || file.replace(/\.heml$/, '.html'))

  /** require .heml extention */
  if (!isHemlFile(file)) {
    log(`${error('ERROR')} ${file} must have ${code('.heml')} extention`)
    process.exit(1)
  }

  try {
    log(`${chalk.bgBlue.black(' COMPILING ')}`)
    log(`${blue(' -')} Reading ${file}`)
    log(`${blue(' -')} Building HEML`)
    const { html, metadata, errors } = await renderHemlFile(filepath, options)

    log(`${blue(' -')} Writing ${metadata.size}`)
    await writeFile(outputpath, html)

    const relativePath = code(path.relative(process.cwd(), outputpath))

    log(errors.length
          ? `\n${errorBlock(' DONE ')} Compiled with errors to ${code(relativePath)} in ${metadata.time}ms\n`
          : `\n${successBlock(' DONE ')} Compiled successfully to ${code(relativePath)} in ${metadata.time}ms\n`)

    if (errors.length) {
      log(error(`${errors.length} ${errors.length > 1 ? 'errors' : 'error'} `))
      errors.forEach((err) => log(`> ${code(err.selector)}\n  ${err.message}`))
    }
  } catch (err) {
    log(`\n${errorBlock(' ERROR ')} ${err.message}\n${dim(err.stack)}`)
  }
}
