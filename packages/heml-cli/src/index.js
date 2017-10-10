import cli from 'commander'

cli
  .usage('<command> [options]')
  .version(require('../package').version)

cli
  .command('develop <file>')
  .description('Develop your email.')
  .option('--open', 'Open the email in your browser')
  .action(require('./commands/develop'))

cli
  .command('build <file>')
  .description('Build an HEML email for sending in the wild.')
  .option('-o, --output <file>', 'The output HTML file')
  .option('-v, --validate [level]', 'Sets the validation level', /^(none|soft|strict)$/i, 'soft')
  .action(require('./commands/build'))

if (!process.argv.slice(2).length) {
  cli.outputHelp()
}

cli.parse(process.argv)
