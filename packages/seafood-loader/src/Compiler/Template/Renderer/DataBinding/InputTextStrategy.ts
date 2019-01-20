import { Strategy } from './Strategy'

export class InputTextStrategy extends Strategy {
    public handle(): void {
        const node = this.virtualElement.getNode() as HTMLInputElement
        const scope = this.virtualElement.getScope()

        node.value = scope.executeExpression(this.bindExpression, (updatedValue: any) => {
            node.value = updatedValue
        })

        node.addEventListener('input', (event: Event) => {
            const context = scope.getContext()

            if (context.hasOwnProperty(this.variableName)) {
                context[this.variableName] = (event as any).target.value
            } else {
                console.error(`Unknown variable '${this.variableName}' have to be data binded.`)
            }
        })
    }
}
