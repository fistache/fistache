class Environment {
  static ProcessAddress: string

  static define(type) {
    if (type) {
      process.env[this.ProcessAddress] = type
    }
  }

  static is(type) {
    if (process.env.hasOwnProperty(this.ProcessAddress)) {
      let env = process.env[this.ProcessAddress]
      if (type && env) {
        return type === env
      }
    } else {
      return false
    }
  }
}

export class RuntimeEnvironment extends Environment {
  static ProcessAddress = 'RUNTIME_ENV'

  static Server = 'server'
  static Client = 'client'

  static defineServer() {
    this.define(RuntimeEnvironment.Server)
  }

  static defineClient() {
    this.define(RuntimeEnvironment.Client)
  }

  static isServer() {
    return this.is(RuntimeEnvironment.Server)
  }

  static isClient() {
    return this.is(RuntimeEnvironment.Client)
  }
}

export class AppEnvironment extends Environment {
  static ProcessAddress = 'APP_ENV'

  static Develop = 'dev'
  static Production = 'prod'
  static Test = 'test'

  static defineDevelop() {
    this.define(AppEnvironment.Develop)
  }

  static defineProduction() {
    this.define(AppEnvironment.Production)
  }

  static defineTest() {
    this.define(AppEnvironment.Test)
  }

  static isDevelop() {
    return this.is(AppEnvironment.Develop)
  }

  static isProduction() {
    return this.is(AppEnvironment.Production)
  }

  static isTest() {
    return this.is(AppEnvironment.Test)
  }
}
