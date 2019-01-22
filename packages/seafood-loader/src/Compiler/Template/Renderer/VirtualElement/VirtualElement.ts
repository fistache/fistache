import { ParsedData } from '../../../ParsedData'
import { AttributeContainer } from '../Attribute/AttributeContainer'
import { InputCheckboxStrategy } from '../DataBinding/InputCheckboxStrategy'
import { InputTextStrategy } from '../DataBinding/InputTextStrategy'
import { VirtualNode } from './VirtualNode'

export enum VirtualElementPresentState {
    Present,
    Missing
}

export class VirtualElement extends VirtualNode {
    /**
     * Used for @if conditinal rendering.
     *
     * A virtual element should not to be rendered if state
     * is missing.
     */
    protected presentState: VirtualElementPresentState = VirtualElementPresentState.Present

    protected shouldListenToElse = false

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
    }

    public render() {
        if (this.parsedData.attribs.technical && this.parsedData.attribs.technical.length) {
            console.log(this.isPresent(), JSON.stringify(this.parsedData.attribs.technical))
        }

        if (this.isPresent()) {
            this.renderIfPresent()
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
        } else {
            presentState = VirtualElementPresentState.Missing
        }

        this.hasBeenIfAttributeValueChanged = presentState !== this.getPresentState()
        this.setPresentState(presentState)

        if (this.hasBeenIfAttributeValueChanged) {
            this.update()

            let nextVirtualNode = this.nextVirtualNode
            while (nextVirtualNode
                && nextVirtualNode instanceof VirtualElement
                && nextVirtualNode.getShouldListenToElse()
                ) {
                nextVirtualNode.update()
                nextVirtualNode = nextVirtualNode.nextVirtualNode
            }
        }
    }

    public update() {
        if (this.getNode()) {
            if (this.isPresent()) {
                this.attach()
            } else {
                this.detach()
            }
        }
    }

    public setPresentState(presentState: VirtualElementPresentState): void {
        this.presentState = presentState
    }

    public getPresentState(): VirtualElementPresentState {
        return this.presentState
    }

    public enableListeningToElse() {
        this.shouldListenToElse = true
    }

    public getShouldListenToElse(): boolean {
        return this.shouldListenToElse
    }

    protected makeNode(): Element | void {
        return document.createElement(this.parsedData.name)
    }

    protected isPresent(): boolean {
        if (this.getPresentState() === VirtualElementPresentState.Missing) {
            return false
        }

        if (this.shouldListenToElse) {
            return !this.checkIfPrevNodesHasElseAndShouldRender()
        }

        return true
    }

    protected renderIfPresent() {
        super.render()
        this.afterRender()
    }

    protected checkIfPrevNodesHasElseAndShouldRender(): boolean {
        let prevVirtualNode = this.prevVirtualNode
        let result = false
        let distance = false

        while (prevVirtualNode && prevVirtualNode instanceof VirtualElement) {
            if (!prevVirtualNode.getShouldListenToElse()) {
                if (distance) {
                    break
                } else {
                    distance = true
                }
            }

            if (prevVirtualNode.isPresent()) {
                result = true
            }

            prevVirtualNode = prevVirtualNode.prevVirtualNode
        }

        return result
    }
}
