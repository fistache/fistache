const qs = require('querystring')
const loaderUtils = require('loader-utils')
const path = require('path')
const hash = require('hash-sum')
const parse = require('./lib/parse')

module.exports = async function(source) {
  const loaderContext = this
  const finish = this.async()
  const {rootContext, resourcePath, resourceQuery} = loaderContext
  const rawQuery = resourceQuery.slice(1)
  const incomingQuery = qs.parse(rawQuery)

  if (incomingQuery.compile) {
    parse(loaderContext, source.toString('utf8'), (error, component) => {
      if (error) {
        finish(error)
        return
      }

      loaderContext.resourcePath += '.ts'
      finish(null, component)
    })
  } else {
    const query = `?seafood&compile=true`
    const loaders = this.loaders.slice()

    const componentRequest = loaderUtils.stringifyRequest(loaderContext, generateLoaders(loaders,resourcePath + query))
    const hmrRequest = loaderUtils.stringifyRequest(loaderContext, path.join(__dirname, 'hmr.js'))

    const context = rootContext || process.cwd()
    const rawFilePath = path
      .relative(context, resourcePath)
      .replace(/^(\.\.[\/\\])+/, '')
    const filePath = rawFilePath.replace(/\\/g, '/') + resourceQuery
    const id = hash(filePath/* + '\n' + source*/)

    finish(null,
      ` import {default as BaseComponent, TemplateRenderer, content} from ${componentRequest}
        import hmr from ${hmrRequest}
        
        class CompiledComponent extends BaseComponent {
          public parentNode = null;
      
          public hmrOptions: object = {};
          public uncompiledTemplate = [];
      
          private renderer = null;
      
          public initHmrOptions() {
              this.hmrOptions = {
                  events: {},
              };
          }
      
          public setContent(content: any) {
              this.uncompiledTemplate = content;
          }
      
          public setRenderer(renderer: any) {
              this.renderer = renderer;
          }
      
          public render(parentNode: any) {
              if (parentNode) {
                  this.parentNode = parentNode;
              } else {
                  parentNode = this.parentNode;
              }
      
              if (!parentNode) {
                  console.warn("Parent node for this component is not specified, cancelling rendering...");
                  return;
              }
      
              // @ts-ignore
              this.renderer
                  .setContext(parentNode)
                  .setContent(this.uncompiledTemplate)
                  .render();
          }
        }
        
        const component = new CompiledComponent()
        component.initHmrOptions()
        component.setContent(content)
        component.setRenderer(new TemplateRenderer())
        
        if (module.hot) {
          module.hot.accept()  
          if (!module.hot.data) {
            hmr.register('${id}', component.hmrOptions)
          } else {
            hmr.reload('${id}', {
              content
            })
          }
        
          module.hot.accept(${componentRequest}, () => {
            hmr.rerender('${id}', {
              content
            })
          })
        }
        
        export default component`
    )
  }
}

module.exports.raw = true

const generateLoaders = (loaders, url) => {
  let result = '!!'
  loaders.forEach(loader => {
    if (typeof loader === 'string') {
      result += `${loader}!`
    } else {
      result += `${loader.path}${loader.options ? '?' + JSON.stringify(loader.options) : ''}!`
    }
  })
  return `${result}${url}`
}
