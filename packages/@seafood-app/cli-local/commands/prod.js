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
      const { createRenderer } = require('@seafood/ssr')

      const clientConfig = projectManager.webpack.getConfig('client')
      const clientCompiler = webpack(clientConfig)

      const render = createRenderer(
        JSON.parse(
          fs.readFileSync(path.resolve('dist/client.json'), 'utf-8')
        ).client.js,
        JSON.parse(
          fs.readFileSync(path.resolve('dist/server.json'), 'utf-8')
        ).server.js,
        fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8')
      )

      initializeApp(app, state, clientCompiler)

      // todo: const app =

      app.use('/dist', express.static(
        path.resolve('dist')
      ))

      app.get('*', async (request, response) => {
        response.setHeader("Content-Type", "text/html")
        response.send(
          await render(request.originalUrl)
        )
      })
    });
}

function initializeApp(app) {
  app.use(require('connect-history-api-fallback')())
}

