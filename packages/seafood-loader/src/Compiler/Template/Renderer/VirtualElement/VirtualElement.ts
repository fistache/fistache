import { ParsedData } from '../../../ParsedData'
import { AttributeContainer } from '../Attribute/AttributeContainer'
import { InputCheckboxStrategy } from '../DataBinding/InputCheckboxStrategy'
import { InputTextStrategy } from '../DataBinding/InputTextStrategy'
import { VirtualNode } from './VirtualNode'

export enum VirtualElementPresentState {
    Present,
    Missing
}

export enum VirtualElementElseResult {
    None,
    True,
    False
}

export class VirtualElement extends VirtualNode {
    public initialElseResult?: VirtualElementElseResult

    /**
     * Used for @if conditinal rendering.
     *
     * A virtual element should not to be rendered if state
     * is missing.
     */
    protected presentState: VirtualElementPresentState = VirtualElementPresentState.Present

    protected elseResult: VirtualElementElseResult = VirtualElementElseResult.None
    protected initiated = false

    protected attibuteContainer: AttributeContainer

    protected bindExpression?: string

    protected nextVirtualNode?: VirtualNode | null
    protected prevVirtualNode?: VirtualNode | null

    private hasBeenIfAttributeValueChanged: boolean = false

    constructor(parsedData: ParsedData, primaryPosition: number, parentVirtualNode: VirtualNode) {
        super(parsedData, primaryPosition, parentVirtualNode)
        this.attibuteContainer = new AttributeContainer(this)

        if (parsedData.attribs.bind) {
            this.bindExpression = parsedData.attribs.bind.trim()
        }
    }

    public beforeRender() {
        super.beforeRender()
        this.attibuteContainer.initialize(this.parsedData.attribs)
        this.attibuteContainer.renderTechnicalAttributes()
        this.nextVirtualNode = this.parentVirtualNode.getNextVirtualNode(this)
        this.prevVirtualNode = this.parentVirtualNode.getPrevVirtualNode(this)
        this.initiated = true
    }

    public render() {
        if (this.isPresent()) {
            this.renderIfPresent()
            this.setNextVirtualNodeElseResultToFalse()
        } else {
            this.setNextVirtualNodeElseResultToTrue()
        }
    }

    public afterRender() {
        super.afterRender()
        this.attibuteContainer.renderStaticAttributes()
        this.attibuteContainer.renderDynamicAttributes()
        this.attibuteContainer.renderEventAttributes()
        this.bindData()
    }

    public bindData() {
        if (this.bindExpression) {
            const isItContextVariable = this.bindExpression.startsWith('this.')
            const variableName = isItContextVariable
                ? this.bindExpression.slice(5 /* 5 is length of 'this.' string */)
                : this.bindExpression
            const node = this.getNode() as Element

            if (isItContextVariable) {
                const tagName = node.tagName.toLowerCase()
                let strategyClass: any

                if (tagName === 'textarea') {
                    strategyClass = InputTextStrategy
                } else if (tagName === 'input') {
                    const inputType = (node as HTMLInputElement).type.toLowerCase()

                    switch (inputType) {
                        case('text'):
                            strategyClass = InputTextStrategy
                            break
                        case('checkbox'):
                            strategyClass = InputCheckboxStrategy
                            break
                    }
                }

                if (strategyClass) {
                    const strategy = new strategyClass(this.bindExpression, variableName, this)
                    strategy.handle()
                }
            } else {
                console.warn(`Data binding is not working with not component variables yet.`)
            }
        }
    }

    public getAttibuteContainer(): AttributeContainer {
        return this.attibuteContainer
    }

    public getNode(): Element | Node {
        return this.node as Element
    }

    public updateIfAttributeValue(expressionValue: any) {
        let presentState

        if (expressionValue) {
            presentState = VirtualElementPresentState.Present
            this.setNextVirtualNodeElseResultToFalse()
        } else {
            presentState = VirtualElementPresentState.Missing
            if (!this.checkIfPrevNodesHasElseAndShouldRender()) {
                this.setNextVirtualNodeElseResultToTrue()
            }
        }

        this.hasBeenIfAttributeValueChanged = presentState !== this.getPresentState()
        this.setPresentState(presentState)

        if (this.hasBeenIfAttributeValueChanged) {
            if (this.getNode()) {
                if (this.isPresent()) {
                    this.attach()
                } else {
                    this.detach()
                }
            }
        }
    }

    public setPresentState(presentState: VirtualElementPresentState): void {
        this.presentState = presentState
    }

    public setElseResult(elseResult: VirtualElementElseResult, force = false) {
        if (force || this.initiated && this.elseResult !== VirtualElementElseResult.None) {
            this.elseResult = elseResult

            if (this.isPresent()) {
                this.renderIfPresent()
            } else if (this.elseResult === VirtualElementElseResult.False) {
                this.detach()
            }

            let nextVirtualNode = this.nextVirtualNode
            while (nextVirtualNode
                && nextVirtualNode instanceof VirtualElement
                && nextVirtualNode.getElseResult() !== VirtualElementElseResult.None
            ) {
                nextVirtualNode.setElseResult(VirtualElementElseResult.False)
                nextVirtualNode = nextVirtualNode.nextVirtualNode
            }
        } else {
            this.initialElseResult = elseResult
        }
    }

    public getPresentState(): VirtualElementPresentState {
        return this.presentState
    }

    public getElseResult(): VirtualElementElseResult {
        return this.elseResult
    }

    protected makeNode(): Element | void {
        return document.createElement(this.parsedData.name)
    }

    protected setNextVirtualNodeElseResultToTrue() {
        if (this.nextVirtualNode && this.nextVirtualNode instanceof VirtualElement) {
            this.nextVirtualNode.setElseResult(VirtualElementElseResult.True)
        }
    }

    protected setNextVirtualNodeElseResultToFalse() {
        if (this.nextVirtualNode && this.nextVirtualNode instanceof VirtualElement) {
            this.nextVirtualNode.setElseResult(VirtualElementElseResult.False)
        }
    }

    protected isPresent(): boolean {
        if (this.getPresentState() === VirtualElementPresentState.Missing) {
            return false
        }

        if (this.elseResult === VirtualElementElseResult.True) {
            console.log(this.checkIfPrevNodesHasElseAndShouldRender(), this.parsedData.attribs.technical)
        }

        if (this.elseResult === VirtualElementElseResult.False) {
            return false
        } else if (this.elseResult === VirtualElementElseResult.True
            && this.checkIfPrevNodesHasElseAndShouldRender()) {
            return false
        }

        return true
    }

    protected renderIfPresent() {
        super.render()
        this.afterRender()
    }

    protected checkIfPrevNodesHasElseAndShouldRender(): boolean {
        let prevVirtualNode = this.prevVirtualNode
        while (prevVirtualNode && prevVirtualNode instanceof VirtualElement) {
            const elseResult = prevVirtualNode.getElseResult()

            if (elseResult === VirtualElementElseResult.None) {
                break
            } else if (prevVirtualNode.isPresent()) {
                return true
            }

            prevVirtualNode = prevVirtualNode.prevVirtualNode
        }

        return false
    }
}
