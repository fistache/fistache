import { VirtualElement } from '../VirtualElement/VirtualElement'

export abstract class Strategy {
    protected bindExpression: string
    protected variableName: string
    protected virtualElement: VirtualElement

    constructor(bindExpression: string, variableName: string, virtualNode: VirtualElement) {
        this.bindExpression = bindExpression
        this.variableName = variableName
        this.virtualElement = virtualNode
    }

    public abstract handle(): void

    protected addEventListener(eventName: string, value: (event: Event) => any) {
        this.virtualElement.getNode().addEventListener(eventName, (event: Event) => {
            const context = this.virtualElement.getScope().getContext()

            if (this.variableName in context) {
                context[this.variableName] = value(event)
            } else {
                console.error(`Unknown variable '${this.variableName}' have to be data binded.`)
            }
        })
    }
}
