// 'use strict';

// import heml from 'heml'
// import HEMLError from 'heml/HEMLError'
// import path from 'path'
// import { writeFile } from 'fs-extra'
// import chalk, { red as error, yellow as code } from 'chalk'
// import isHemlFile from '../utils/isHemlFile'
// import renderHemlFile from '../utils/renderHemlFile'

// const errorBlock = chalk.bgRed.black
// const { log } = console

// async function build(file, options) {
//   const filepath = path.join(process.cwd(), file);
//   const outputpath = path.join(process.cwd(), options.output || file.replace(/\.heml$/, '.html'));
//   const startTime = process.hrtime();

//   if (!isHemlFile(file)) {
//     log(`${error('ERROR')} ${file} must have ${code('.heml')} extention`)
//     process.exit(1)
//   }

//   try {
//     const startTime = process.hrtime();
//     log(`${chalk.bgBlue.black(' COMPILING ')}`);
//     log(`${chalk.blue(' -')} Reading ${file}`);
//     log(`${chalk.blue(' -')} Building HEML`);
//     const { html, metaadate, errors } = await renderHemlFile(filepath, options)

//     console.log(`${chalk.blue(' -')} Writing ${metadata.size}`);
//     await writeFile(outputpath, html);

//     const totalTime = Math.round(process.hrtime(startTime)[1] / 1000000);
//     const relativePath = chalk.yellow(path.relative(process.cwd(), outputpath))

//     log(errors.length ?
//           `\n${chalk.bgRed.black(' DONE ')} Compiled with errors to ${code(relativePath)} in ${totalTime}ms\n` :
//           `\n${chalk.bgGreen.black(' DONE ')} Compiled successfully to ${code(relativePath)} in ${totalTime}ms\n`)

//     if (errors.length) {
//       console.log(chalk.red(`${errors.length} validation ${errors.length > 1 ? 'errors' : 'error'}`));
//       errors.forEach((err) => log(`> ${code(err.selector)}\n  ${err.message}`);
//     }
//   }
//   catch(err) {
//     if (err instanceof HEMLError) {
//       console.log(`\n${errorBlock(' ERROR ')} Failed to compile ${code(file)}`);
//       log(`> ${code(err.selector)}\n  ${err.message}`);
//       console.log(`\nUse ${code('--validate=none')} to skip validation\n`);

//     }
//     else {
//       console.log(`\n${errorBlock(' ERROR ')} ${err.message}`)
//     }
//   }
// };
