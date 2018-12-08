const {Event} = require('@seafood/component')

let hmrData = Object.create(null)

const nofityIfRerenderCrashed = (rerender) => {
  return (id, options) => {
    // todo: remove comments
    // try {
      rerender(id, options)
    // } catch (exception) {
    //   console.error(exception.message)
    //   console.error(exception.stackTrace)
    //   console.warn(
    //     'Something went wrong during hot-reload. Full reload required.'
    //   )
    // }
  }
}

const addComponentEventHandler = (options, eventName, handler) => {
  if (!options.events[eventName]) {
    options.events[eventName] = []
  }

  options.events[eventName].push(handler)
}

module.exports.register = (id, options) => {
  if (hmrData[id]) {
    return
  }

  const constructor = null
  bindConstructor(id, options)

  hmrData[id] = {
    constructor,
    options,
    components: []
  }
}

const bindConstructor = (id, options) => {
  // do not use arrow function cause we need to bind a context for "this"
  addComponentEventHandler(options, Event.Created, function() {
    const sessionData = hmrData[id]

    if (!sessionData.constructor) {
      sessionData.constructor = this.constructor
    }

    sessionData.components.push(this)
  })
  addComponentEventHandler(options, Event.Destroyed, function() {
    // todo: implement
  })
}

module.exports.bindConstructor = bindConstructor

module.exports.rerender = nofityIfRerenderCrashed((id, options) => {
  const hmrSession = hmrData[id]
  if (hmrSession && hmrSession.constructor) {
    hmrSession.components.forEach(component => {
      component.setContent(options.content)
      component.render()
    })
  }
})

module.exports.reload = nofityIfRerenderCrashed((id, options) => {
  const hmrSession = hmrData[id]
  if (options && options.content) {
    if (hmrSession && hmrSession.constructor) {
      hmrSession.components.forEach(component => {
        component.setContent(options.content)
        component.render()
      })
    }
  }
})
