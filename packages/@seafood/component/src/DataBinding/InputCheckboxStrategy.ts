import { Strategy } from './Strategy'

export class InputCheckboxStrategy extends Strategy {
    public handle(): void {
        const scope = this.virtualElement.getScope()
        const expressionValue = scope.executeExpression(
            this.bindExpression,
            (updatedValue: any) => {
                this.setValue(updatedValue)
            }
        )

        this.setValue(expressionValue)
        this.addEventListener('input', (event: Event) => {
            return (event.target as HTMLInputElement).checked
        })
    }

    private setValue(value: any) {
        const node = this.virtualElement.getNode() as Element
        const attributeName = 'checked'

        if (value) {
            node.setAttribute(attributeName, attributeName)
        } else {
            node.removeAttribute(attributeName)
        }
    }
}
