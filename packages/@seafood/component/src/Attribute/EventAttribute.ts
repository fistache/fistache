import { VirtualElement } from '../VirtualNode/VirtualElement'
import { DynamicAttribute } from './DynamicAttribute'

export class EventAttribute extends DynamicAttribute {
    public append(): void {
        const virtualElement = this.getVirtualElement() as VirtualElement
        const node = virtualElement.getNode() as Element
        const context = virtualElement.getScope().getContext()
        const isItContextVariable = (this.value as string).startsWith('this.')
        const variableName = isItContextVariable
            ? (this.value as string).slice(5 /* 5 is length of 'this.' */)
            : (this.value as string)

        // todo: remove code duplication in data binding and here

        if (isItContextVariable) {
            node.addEventListener(this.getName(), () => {
                if (variableName in context) {
                    context[variableName]()
                } else {
                    console.error(`Unknown variable '${variableName}' have ` +
                                      `to be event binded.`)
                }
            })
        } else {
            console.warn(`Event binding is not working with not ` +
                             `component variables yet.`)
        }
    }
}
