import chalk from 'chalk'

const prefix = `[seafood-server-renderer-webpack-plugin]`
const warn = (msg: string) => console.error(chalk.red(`${prefix} ${msg}\n`))
const tip = (msg: string) => console.log(chalk.yellow(`${prefix} ${msg}\n`))

export const validate = (compiler: any) => {
    if (compiler.options.target !== 'node') {
        warn('webpack config `target` should be "node".')
    }

    if (compiler.options.output
        && compiler.options.output.libraryTarget !== 'commonjs2'
    ) {
        warn('webpack config `output.libraryTarget` should be "commonjs2".')
    }

    if (!compiler.options.externals) {
        tip(
            'It is recommended to externalize dependencies `' +
            '+ `in the server build for better build performance.'
        )
    }
}

export const isJS = (file: string): boolean =>
    /\.js(\?[^.]+)?$/.test(file)

export const isCSS = (file: string): boolean =>
    /\.css(\?[^.]+)?$/.test(file)
