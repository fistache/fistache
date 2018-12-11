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
            if (!module.hot.data) {
                ${SeafoodLoader.EXPORT_HMR_INSTANCE}.register(
                    '${this.requestId}',
                    ${SeafoodLoader.EXPORT_SCRIPT_INSTANCE}
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
            ${SeafoodLoader.EXPORT_HMR_INSTANCE}.update(
                '${this.requestId}',
                ${SeafoodLoader.EXPORT_SCRIPT_INSTANCE}
            )
        })
        `;
    }
}
