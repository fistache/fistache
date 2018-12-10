import {SeafoodLoader} from "../SeafoodLoader";

export class HmrPlugin {
    private readonly requestId: string;
    private componentRequest?: string;

    constructor(requestId: string) {
        this.requestId = requestId;
    }

    public setComponentRequest(request: string) {
        this.componentRequest = request;
    }

    public generateCode(): string {
        return `
        if (module.hot) {
            if (!module.hot.data) {
                ${SeafoodLoader.EXPORT_HMR_CLASS_NAME}.register(
                    '${this.requestId}',
                    ${SeafoodLoader.EXPORT_COMPONENT_INSTANCE_NAME}
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
            ${SeafoodLoader.EXPORT_HMR_CLASS_NAME}.update(
                '${this.requestId}',
                ${SeafoodLoader.EXPORT_COMPONENT_INSTANCE_NAME}
            )
        })
        `;
    }
}
