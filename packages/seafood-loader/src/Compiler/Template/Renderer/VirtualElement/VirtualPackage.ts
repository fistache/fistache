import { ParsedData } from '../../Parser/ParsedData'
import { VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'

export interface ForExpressionResult {
    variable?: string
    value: any
}

export class VirtualPackage extends VirtualNode {
    private readonly maquetteVirtualElement?: VirtualElement

    constructor(parsedData: ParsedData, maquetteVirtualElement: VirtualElement) {
        super(parsedData, parsedData.position)
        this.maquetteVirtualElement = maquetteVirtualElement
    }

    protected makeNode(): Node {
        const documentFragment = document.createDocumentFragment()
        const forExpressionResult = this.getForExpressionResult()
        let secondaryPosition = 0

        if (this.maquetteVirtualElement) {
            for (let i = 0; i < forExpressionResult.value; i++) {
                const clonedVirtualNode = this.maquetteVirtualElement.clone()

                this.storeVirtualNode(clonedVirtualNode)
                clonedVirtualNode.setSecondaryPosition(secondaryPosition)
                documentFragment.appendChild(clonedVirtualNode.getNode())

                secondaryPosition++
            }
        }

        return documentFragment
    }

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
