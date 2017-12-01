import path from 'path'
import express from 'express'
import reloadServer from 'reload'
import openUrl from 'open'
import logUpdate from 'log-update'
import boxen from 'boxen'
import gaze from 'gaze'
import getPort from 'get-port'
import chalk, { red as error, yellow as code } from 'chalk'
import isHemlFile from '../utils/isHemlFile'
import renderHemlFile from '../utils/renderHemlFile'
import buildErrorPage from '../utils/buildErrorPage'

const errorBlock = chalk.bgRed.white
const { log } = console

export default async function develop (file, options) {
  const filepath = path.resolve(file)
  const {
    port = 3000,
    open = false
  } = options

  /** require .heml extention */
  if (!isHemlFile(file)) {
    log(`${error('ERROR')} ${file} must have ${code('.heml')} extention`)
    process.exit(1)
  }

  try {
    const { update, url } = await startDevServer(path.dirname(filepath), port)
    const { html, errors, metadata } = await renderHemlFile(filepath)

    update({ html, errors, metadata })

    if (open) openUrl(url)

    /** watch for file changes */
    gaze(filepath, function (err) {
      if (err) throw err

      this.on('changed', async (changedFile) => {
        const { html, errors, metadata } = await renderHemlFile(filepath)
        update({ html, errors, metadata })
      })

      this.on('deleted', async (changedFile) => {
        log(`${errorBlock(' Error ')} ${code(file)} was deleted. Shutting down.`)
        process.exit()
      })
    })
  } catch (err) {
    if (err.code === 'ENOENT') {
      log(`${errorBlock(' Error ')} ${code(file)} doesn't exist`)
    } else {
      log(`${errorBlock(' Error ')} ${err.message}`)
    }
    process.exit()
  }
}

/**
 * update the cli UI
 * @param  {String} params.url     URL for preview server
 * @param  {String} params.status  the current status
 * @param  {String} params.time    time to compile the heml
 * @param  {String} params.size    size of the HTML in mb
 */
function renderCLI ({ url, status, time, size }) {
  return logUpdate(boxen(
    `${chalk.bgBlue.black(' HEML ')}\n\n` +
    `- ${chalk.bold('Preview:')}         ${url}\n` +
    `- ${chalk.bold('Status:')}          ${status}\n` +
    `- ${chalk.bold('Compile time:')}    ${time}ms\n` +
    `- ${chalk.bold('Total size:')}      ${size}`,
    { padding: 1, margin: 1 }))
}

/**
 * Launches a server that reloads when the update function is called
 * @param  {String} defaultPreview  the default content for when the sever loads
 * @return {Object}                 { server, port, update }
 */
function startDevServer (directory, port = 3000) {
  let url
  const app = express()
  const { reload } = reloadServer(app)
  let preview = ''

  app.get('/', (req, res) => res.send(preview))
  app.use(express.static(directory))

  function update ({ html, errors, metadata }) {
    let status = errors.length ? chalk.red('failed') : chalk.green('success')
    preview = errors.length
      ? buildErrorPage(errors)
      : html.replace('</body>', '<script src="/reload/reload.js"></script></body>')

    renderCLI({ url, status, time: metadata.time, size: metadata.size })
    reload()
  }

  return new Promise((resolve, reject) => {
    getPort({ port }).then((availablePort) => {
      url = `http://localhost:${availablePort}`

      app.listen(availablePort, () => resolve({ update, url, app }))
    })

    process.on('uncaughtException', reject)
  })
}
