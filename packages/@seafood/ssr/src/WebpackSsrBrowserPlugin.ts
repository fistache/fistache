import hash from 'hash-sum'
import uniq from 'lodash.uniq'
import { isCSS, isJS } from './util'

// copyright (c) Evan You

export class WebpackSsrBrowserPlugin {
    private options: any

    constructor(options = {}) {
        this.options = Object.assign({
            filename: 'client.json'
        }, options)
    }

    public apply(compiler: any) {
        compiler.hooks.emit.tapAsync(
            'WebpackSsrBrowserPlugin',
            (compilation: any, callback: any) => {
                const stats = compilation.getStats().toJson()

                const allFiles = uniq(stats.assets.map((a: any) => a.name))

                const initialFiles = uniq(
                    Object.keys(stats.entrypoints)
                        .map((name: any) => stats.entrypoints[name].assets)
                        .reduce((assets, all) => all.concat(assets), [])
                        .filter((file: any) => isJS(file) || isCSS(file))
                )

                const asyncFiles = allFiles
                    .filter((file: any) => isJS(file) || isCSS(file))
                    .filter((file: any) => initialFiles.indexOf(file) < 0)

                const manifest: any = {
                    publicPath: stats.publicPath,
                    all: allFiles,
                    initial: initialFiles,
                    async: asyncFiles,
                    modules: {}
                }

                const assetModules = stats.modules.filter(
                    (m: any) => m.assets.length
                )
                const fileToIndex = (file: any) => manifest.all.indexOf(file)
                stats.modules.forEach((m: any) => {
                    // ignore modules duplicated in multiple chunks
                    if (m.chunks.length === 1) {
                        const cid = m.chunks[0]
                        const chunk = stats.chunks.find(
                            (c: any) => c.id === cid
                        )
                        if (!chunk || !chunk.files) {
                            return
                        }
                        const id = m.identifier.replace(/\s\w+$/, '')
                        const files = manifest.modules[hash(id)]
                            = chunk.files.map(fileToIndex)
                        // find all asset modules associated with the same chunk
                        assetModules.forEach((m1: any) => {
                            if (m1.chunks.some((id1: any) => id1 === cid)) {
                                files.push.apply(files, m1.assets.map(
                                    fileToIndex
                                ))
                            }
                        })
                    }
                })

                const json = JSON.stringify(manifest, null, 2)
                compilation.assets[this.options.filename] = {
                    source: () => json,
                    size: () => json.length
                }

                callback()
            }
        )
    }
}
