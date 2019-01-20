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
}
