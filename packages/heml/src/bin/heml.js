#!/usr/bin/env node

import cli from 'commander'
import { first } from 'lodash'
import develop from './commands/develop'
import build from './commands/build'
import { version } from '../../package'

const commands = ['develop', 'build']
const args = process.argv.slice(2)

cli
  .usage('<command> [options]')
  .version(version)

cli
  .command('develop <file>')
  .description('Develop your email locally.')
  .option('--open', 'Open the email in your browser')
  .option('-p, --port <number>', 'Port for server', 3000)
  .action(develop)

cli
  .command('build <file>')
  .description('Build an HEML email for sending in the wild.')
  .option('-o, --output <file>', 'The output HTML file')
  .option('-v, --validate [level]', 'Sets the validation level', /^(none|soft|strict)$/i, 'soft')
  .action(build)

if (args.length === 0 || !commands.includes(first(args)) && !first(args).startsWith('-')) {
  cli.outputHelp()
}

cli.parse(process.argv)
