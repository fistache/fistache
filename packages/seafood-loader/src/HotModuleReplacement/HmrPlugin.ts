import {SeafoodLoader} from "../SeafoodLoader";

export class HmrPlugin {
    private readonly requestId: string;
    private componentRequest?: string;

    constructor(requestId: string) {
        this.requestId = requestId;
    }

    public setTemplateRequest(request: string) {
        this.componentRequest = request;
    }

    public generateCode(): string {
        return `
        if (module.hot) {
            module.hot.accept();
            if (module.hot.data) {
                ${SeafoodLoader.EXPORT_HMR_INSTANCE}.getInstance().rerender(
                    '${this.requestId}',
                    {
                        ${SeafoodLoader.EXPORT_SCRIPT_INSTANCE},
                    }
                )
            } else {
                ${SeafoodLoader.EXPORT_HMR_INSTANCE}.getInstance().register(
                    '${this.requestId}',
                    ${SeafoodLoader.EXPORT_SCRIPT_INSTANCE}.hmrOptions
                )
            }

            ${this.generateComponentUpdateCode()}
        }
        `;
    }

    private generateComponentUpdateCode(): string {
        if (!this.componentRequest) {
            return "";
        }

        return `
        module.hot.accept(${this.componentRequest}, () => {
            ${SeafoodLoader.EXPORT_HMR_INSTANCE}.getInstance().rerender(
                '${this.requestId}',
                {
                    ${SeafoodLoader.EXPORT_SCRIPT_INSTANCE},
                }
            )
        })
        `;
    }
}
