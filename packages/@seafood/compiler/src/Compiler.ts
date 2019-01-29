export class Compiler {
    private source: string
    private doneCallback?: () => void
    private renderFunction = ''

    constructor(source: string) {
        this.source = source
    }

    public done(callback: () => void) {
        this.doneCallback = callback
    }

    public getRenderFunction(): string {
        return this.renderFunction
    }

    private fireDoneCallbackIfExists() {
        if (this.doneCallback) {
            this.doneCallback()
        }
    }
}

export function compile(source: string, callback: (result: string) => void) {
    const compiler = new Compiler(source)

    compiler.done(() => {
        callback(compiler.getRenderFunction())
    })
}
