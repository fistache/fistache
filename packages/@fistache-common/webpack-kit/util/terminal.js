const handleCloseEvent = (...servers) => {
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      servers.forEach(server => {
        server.close(() => {
          process.exit(0)
        })
      })
    })
  })
}

module.exports = {
  handleCloseEvent
}
