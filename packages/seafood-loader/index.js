const compiler = require('./src/Compiler')

module.exports = function(source, sourceMap) {
  const finish = this.async()

  compiler()
    .setCallback((error, structure) => {
      if (error) {
        finish(error)
      }

      const exportString = makeExportString([
        structure.getScriptContent(),
        ``,
        `export const __$render__ = ${(() => {}).toString()}`,
        ``
      ])

      finish(null, exportString, sourceMap)
    })
    .compile(source)
}

const makeExportString = (lines) => {
  return lines.join("\n")
}
