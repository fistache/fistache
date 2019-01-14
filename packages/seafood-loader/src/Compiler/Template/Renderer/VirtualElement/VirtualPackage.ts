import { ParsedData } from '../../Parser/ParsedData'
import { PROXY_TARGET_SYMBOL } from '../Reactivity/Reactivity'
import Renderer from '../Renderer'
import { VirtualElement } from './VirtualElement'
import { VirtualNode } from './VirtualNode'
import { VirtualTree } from './VirtualTree'

export interface ForExpressionResult {
    variable?: string
    value: any
}

export class VirtualPackage extends VirtualElement {
    private readonly maquetteVirtualElement: VirtualNode
    private readonly forExpressionOrigin: string
    private forExpressionResult?: ForExpressionResult

    constructor(
        parsedData: ParsedData,
        maquetteVirtualElement: VirtualNode,
        parentVirtualNode: VirtualNode,
        forExpression: string
    ) {
        super(parsedData, parsedData.position, parentVirtualNode)
        this.maquetteVirtualElement = maquetteVirtualElement
        this.forExpressionOrigin = forExpression
    }

    public render() {
        this.resolveForAttribute()
    }

    public clone(): VirtualNode {
        return new VirtualPackage(
            this.parsedData,
            this.maquetteVirtualElement.clone() as VirtualElement,
            this.parentVirtualNode,
            this.forExpressionOrigin
        )
    }

    protected makeNode(): void {}

    private resolveForAttribute() {
        if (this.forExpressionOrigin.includes(' of ')) {
            this.appendForOfAttribute()
        } else if (this.forExpressionOrigin.includes(' in ')) {
            this.appendForInAttribute()
        } else {
            this.appendForNAttribute()
        }
    }

    private appendForOfAttribute() {
        const expressionParts = this.forExpressionOrigin.split(' of ', 2)
        const variable = expressionParts[0]
        const expression = expressionParts[1]

        if (variable.length && expression.length) {
            const expressionResult = this.getScope().executeExpression(expression, (value: any, depth?: number) => {
                if (!depth || depth <= 1) {
                    this.updateForOfExpression(value)
                }
            })

            this.forExpressionResult = {
                variable,
                value: expressionResult
            }

            this.renderForOfExpression()
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

    private renderForOfExpression(isItUpdate: boolean = false) {
        const expressionResult = this.forExpressionResult as ForExpressionResult
        for (const index in expressionResult.value) {
            if (expressionResult.value.hasOwnProperty(index) && !this.childVirtualNodes.hasOwnProperty(index)) {
                const expressionValue = expressionResult.value[index]
                const virtualNode = this.renderMaquette(+index, {
                    variable: expressionResult.variable,
                    value: expressionValue
                })
                if (isItUpdate) {
                    this.renderFragmentOnTree(virtualNode)
                }
            }
        }
    }

    private updateForOfExpression(value: any) {
        (this.forExpressionResult as ForExpressionResult).value = value
        this.updateForExpression(value, () => {
            this.renderForOfExpression(true)
        })
    }

    private updateForExpression(
        value: any,
        callback: () => void
    ): void {
        if (Array.isArray(value)) {
            const rudenantIndecies: any[] = []

            for (const valueIndex in this.childVirtualNodes) {
                if (this.childVirtualNodes.hasOwnProperty(valueIndex)) {
                    if (!value.hasOwnProperty(valueIndex)) {
                        rudenantIndecies.push(valueIndex)
                    }
                }
            }

            if (rudenantIndecies.length) {
                this.cleanCollection(rudenantIndecies, (index: number) => {
                    // get original object cause we use value.splice
                    // and we don't want to trigger rerender one more time
                    if (value[PROXY_TARGET_SYMBOL]) {
                        value = value[PROXY_TARGET_SYMBOL]
                    }

                    value.splice(index, 1)
                })
            }

            callback()
        } else {
            // todo: implement object @for rendering
        }
    }

    private cleanCollection(rudenantIndecies: number[], callback?: (index: number) => void): void {
        const collection = this.childVirtualNodes.slice()

        for (const index of rudenantIndecies) {
            collection[index].delete()
            collection.splice(index, 1)

            if (callback) {
                callback(index)
            }
        }

        this.childVirtualNodes = collection
    }

    private renderMaquette(secondaryPosition: number, expressionResult: ForExpressionResult): VirtualNode {
        const clonedVirtualNode = this.maquetteVirtualElement.clone()

        if (clonedVirtualNode instanceof VirtualElement) {
            clonedVirtualNode.getAttibuteContainer().extend(this.getAttibuteContainer())
        }

        if (expressionResult.variable) {
            clonedVirtualNode.getScope().setVariable(expressionResult.variable, expressionResult.value)
        }

        clonedVirtualNode.setSecondaryPosition(secondaryPosition)
        this.addChildVirtualNode(clonedVirtualNode, secondaryPosition)

        return clonedVirtualNode
    }

    private renderFragmentOnTree(virtualNode: VirtualNode) {
        const context = virtualNode.getScope().getContext()
        const virtualTree = new VirtualTree()
        const parentVirtualNode = virtualNode.getParentVirtualNode() as VirtualNode
        let nextSibling = this.getNextSiblingNode(virtualNode.getPosition())

        if (!nextSibling) {
            nextSibling = parentVirtualNode.getNextSiblingNode(this.getPosition())
        }

        virtualTree.getScope().setContext(context)
        virtualTree.beforeRender()

        virtualNode.setParentVirtualNode(virtualTree)
        Renderer.renderFragment([virtualNode], context)
        virtualNode.setParentVirtualNode(parentVirtualNode)

        const node = virtualNode.getNode()
        const treeNode = virtualTree.getNode()

        treeNode.removeChild(node)
        virtualNode.attach(nextSibling)
    }
}
