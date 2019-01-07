import { ParsedData } from '../../Parser/ParsedData'
import { AttributeContainer } from '../Attribute/AttributeContainer'
import { VirtualNode } from './VirtualNode'

export class VirtualElement extends VirtualNode {
    protected attibuteContainer: AttributeContainer

    constructor(parsedData: ParsedData, primaryPosition: number, parentVirtualNode: VirtualNode) {
        super(parsedData, primaryPosition, parentVirtualNode)
        this.attibuteContainer = new AttributeContainer()
    }

    public beforeRender() {
        this.attibuteContainer.initialize(this.parsedData.attribs)
    }

    public getAttibuteContainer(): AttributeContainer {
        return this.attibuteContainer
    }

    public getNode(): Element {
        return this.node as Element
    }

    protected makeNode(): Element | void {
        return document.createElement(this.parsedData.name)
    }
}
