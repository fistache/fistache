import { ParsedData } from '../../Parser/ParsedData'
import { VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'

export interface ForExpressionResult {
    variable?: string
    value: any
}

export class VirtualPackage extends VirtualElement {
    private readonly maquetteVirtualElement: VirtualNode
    private readonly forExpression: string

    constructor(
        parsedData: ParsedData,
        maquetteVirtualElement: VirtualNode,
        parentVirtualNode: VirtualNode,
        forExpression: string
    ) {
        super(parsedData, parsedData.position, parentVirtualNode)
        this.maquetteVirtualElement = maquetteVirtualElement
        this.forExpression = forExpression
    }

    public render() {
        this.resolveForAttribute()
    }

    public clone(): VirtualNode {
        return new VirtualPackage(
            this.parsedData,
            this.maquetteVirtualElement.clone() as VirtualElement,
            this.parentVirtualNode,
            this.forExpression
        )
    }

    protected makeNode(): void {}

    private resolveForAttribute() {
        if (this.forExpression.includes(' of ')) {
            this.appendForOfAttribute()
        } else if (this.forExpression.includes(' in ')) {
            this.appendForInAttribute()
        } else {
            this.appendForNAttribute()
        }
    }

    private appendForOfAttribute() {
        const expressionParts = this.forExpression.split(' of ', 2)
        const variable = expressionParts[0]
        const expression = expressionParts[1]

        if (variable.length && expression.length) {
            const expressionResult = this.getScope().executeExpression(expression, (value: any, depth?: number) => {
                if (!depth || depth <= 1) {
                    this.updateForOfExpression(value)
                }
            })

            for (const index in expressionResult) {
                if (expressionResult.hasOwnProperty(index)) {
                    const expressionValue = expressionResult[index]
                    this.renderMaquette(+index, {
                        variable,
                        value: expressionValue
                    })
                }
            }
        } else {
            console.warn('Variable name or expression is not provided in @for..of attribute.')
        }
    }

    private updateForOfExpression(value: any) {
        console.log(value)
    }

    private appendForInAttribute() {
        //
    }

    private appendForNAttribute() {
        //
    }

    private renderMaquette(secondaryPosition: number, expressionResult: ForExpressionResult) {
        const clonedVirtualNode = this.maquetteVirtualElement.clone()

        if (clonedVirtualNode instanceof VirtualElement) {
            clonedVirtualNode.getAttibuteContainer().extend(this.getAttibuteContainer())
        }

        clonedVirtualNode.setSecondaryPosition(secondaryPosition)
        if (expressionResult.variable) {
            clonedVirtualNode.getScope().setVariable(expressionResult.variable, expressionResult.value)
        }
        this.addChildVirtualNode(clonedVirtualNode)
    }
}
