import { VirtualElement } from '../VirtualElement/VirtualElement'
import { NonStaticAttribute } from './NonStaticAttribute'

export class EventAttribute extends NonStaticAttribute {
    public append(): void {
        const virtualElement = this.getVirtualElement() as VirtualElement
        const node = virtualElement.getNode() as Element
        const context = virtualElement.getScope().getContext()
        const isItContextVariable = this.value.startsWith('this.')
        const variableName = isItContextVariable
            ? this.value.slice(5 /* 5 is length of 'this.' string */)
            : this.value

        // todo: remove code duplication in data binding and here

        if (isItContextVariable) {
            node.addEventListener(this.getName(), () => {
                if (variableName in context) {
                    context[variableName]()
                } else {
                    console.error(`Unknown variable '${variableName}' have to be event binded.`)
                }
            })
        } else {
            console.warn(`Event binding is not working with not component variables yet.`)
        }
    }
}
