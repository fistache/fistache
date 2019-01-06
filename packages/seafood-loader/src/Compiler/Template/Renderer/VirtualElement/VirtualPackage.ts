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
            this.addChildVirtualNode(clonedVirtualNode)
        }
    }

    public setParentVirtualNode(virtualNode: VirtualNode) {
        super.setParentVirtualNode(virtualNode)
        this.maquetteVirtualElement.setParentVirtualNode(virtualNode)
    }

    public clone(): VirtualNode {
        return new VirtualPackage(
            this.parsedData,
            this.maquetteVirtualElement.clone() as VirtualElement,
            this.parentVirtualNode
        )
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
