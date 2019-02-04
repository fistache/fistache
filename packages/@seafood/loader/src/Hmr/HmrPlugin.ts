export class HmrPlugin {
    private readonly requestId: string
    private componentRequest?: string

    constructor(requestId: string) {
        this.requestId = requestId
    }

    public setTemplateRequest(request: string) {
        this.componentRequest = request
    }

    public generateCode(): string {
        return `
        if (module.hot) {
            module.hot.accept();
            if (module.hot.data) {
                Hmr.getInstance().rerender(
                    '${this.requestId}',
                    {
                        script,
                    }
                )
            } else {
                Hmr.getInstance().register(
                   '${this.requestId}',
                   script
                )
            }

            ${this.generateComponentUpdateCode()}
        }
        `
    }

    private generateComponentUpdateCode(): string {
        if (!this.componentRequest) {
            return ''
        }

        return `
        module.hot.accept(${this.componentRequest}, () => {
            Hmr.getInstance().rerender(
                '${this.requestId}',
                {
                    script,
                }
            )
        })
        `
    }
}
