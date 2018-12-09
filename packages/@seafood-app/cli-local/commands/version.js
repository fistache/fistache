/**
 * The command to print package version.
 */
module.exports = program => {
  program
    .version(require('../package.json').version, '-v, --version')
}
