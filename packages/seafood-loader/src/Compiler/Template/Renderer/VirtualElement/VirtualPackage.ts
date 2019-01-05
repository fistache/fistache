import { ParsedData } from '../../Parser/ParsedData'
import { VirtualElement } from './VirtualElement'
// import { VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'

export interface ForExpressionResult {
    variable?: string
    value: any
}

export class VirtualPackage extends VirtualNode {
    private readonly maquetteVirtualElement: VirtualElement

    constructor(parsedData: ParsedData, maquetteVirtualElement: VirtualElement, parentVirtualNode: VirtualNode) {
        super(parsedData, parsedData.position, parentVirtualNode)
        this.maquetteVirtualElement = maquetteVirtualElement
    }

    public render() {
        const forExpressionResult = this.getForExpressionResult()

        for (let secondaryPosition = 0; secondaryPosition < forExpressionResult.value; secondaryPosition++) {
            const clonedVirtualNode = this.maquetteVirtualElement.clone()

            clonedVirtualNode.setSecondaryPosition(secondaryPosition)
            this.storeVirtualNode(clonedVirtualNode)
        }
    }

    public clone(): VirtualNode {
        // @ts-ignore
        return new this.constructor(this.parsedData, this.maquetteVirtualElement, this.parentVirtualNode)
    }

    protected makeNode(): void {}

    private getForExpression(): string {
        return this.parsedData.attribs['@for']
    }

    private getForExpressionResult(): ForExpressionResult {
        const expression = this.getForExpression()
        const value = +expression

        return {
            value
        }
    }
}
