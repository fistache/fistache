import { ParsedData } from '../../Parser/ParsedData'
import { PROXY_TARGET_SYMBOL } from '../Reactivity/Reactivity'
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

    private appendForInAttribute() {
        //
    }

    private appendForNAttribute() {
        //
    }

    private updateForOfExpression(value: any) {
        console.log(value)
    }

    private updateForExpression(
        updatedExpressionValue: any,
        callback: () => void,
        expressionResult?: ForExpressionResult
    ): void {
        if (expressionResult) {
            expressionResult.value = updatedExpressionValue

            if (Array.isArray(updatedExpressionValue)) {
                const rudenantIndecies: any[] = []

                for (const valueIndex in this.childVirtualNodes) {
                    if (this.childVirtualNodes.hasOwnProperty(valueIndex)) {
                        if (!updatedExpressionValue.hasOwnProperty(valueIndex)) {
                            rudenantIndecies.push(valueIndex)
                        }
                    }
                }

                this.cleanCollection(rudenantIndecies, (index: number) => {
                    if (expressionResult) {
                        let value = expressionResult.value

                        // get original object cause we use value.splice
                        // and we don't want to trigger rerender one more time
                        if (value[PROXY_TARGET_SYMBOL]) {
                            value = value[PROXY_TARGET_SYMBOL]
                        }

                        value.splice(index, 1)
                    }
                })

                callback()
            } else {
                // todo: implement object @for rendering
            }
        }
    }

    private cleanCollection(rudenantIndecies: number[], callback?: (index: number) => void): void {
        const collection = this.childVirtualNodes.slice()

        for (const index of rudenantIndecies) {
            this.childVirtualNodes[index].delete()
            collection.splice(index, 1)

            if (callback) {
                callback(index)
            }
        }

        this.childVirtualNodes = collection
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
