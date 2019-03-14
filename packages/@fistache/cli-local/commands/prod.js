module.exports = (program, projectManager) => {
  program
    .command('prod')
    .allowUnknownOption()
    .action(() => {
      const webpack = require('webpack')
      const express = require('express')

      projectManager.setMode('production')

      const fs = require('fs')
      const path = require('path')
      const favicon = require('serve-favicon')
      const { createRenderer } = require('@fistache/ssr')

      const app = express()

      const render = createRenderer(
        JSON.parse(
          fs.readFileSync(path.resolve('dist/client.json'), 'utf-8')
        ).client.js,
        fs.readFileSync(path.join('.', JSON.parse(
          fs.readFileSync(path.resolve('dist/server.json'), 'utf-8')
        ).server.js), 'utf-8'),
        fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8')
      )

      app.use(require('connect-history-api-fallback')())

      app.use(favicon(path.resolve('resources/images/logo/logo@32.png')))
      app.use('/dist', express.static(
        path.resolve('dist')
      ))

      app.get('*', async (request, response) => {
        response.setHeader("Content-Type", "text/html")
        response.send(
          await render(`http://localhost:8080${request.originalUrl}`)
        )
      })

      app.listen(8080)
    });
}
