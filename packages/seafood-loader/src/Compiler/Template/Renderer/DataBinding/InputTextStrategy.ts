import { Strategy } from './Strategy'

export class InputTextStrategy extends Strategy {
    public handle(): void {
        const node = this.virtualElement.getNode() as HTMLInputElement
        const scope = this.virtualElement.getScope()

        node.value = scope.executeExpression(this.bindExpression, (updatedValue: any) => {
            node.value = updatedValue
        })
        this.addEventListener('input', (event: Event) => {
            return (event.target as HTMLInputElement).value
        })
    }
}
