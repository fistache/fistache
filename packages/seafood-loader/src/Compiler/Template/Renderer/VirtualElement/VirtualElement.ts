import { ParsedData } from '../../../ParsedData'
import { AttributeContainer } from '../Attribute/AttributeContainer'
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

    protected attibuteContainer: AttributeContainer

    protected bindExpression?: string

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
    }

    public render() {
        this.attibuteContainer.renderTechnicalAttributes()

        if (this.isPresent()) {
            super.render()
            this.afterRender()
            this.bindData()
        }
    }

    public afterRender() {
        super.afterRender()
        this.attibuteContainer.renderStaticAttributes()
        this.attibuteContainer.renderDynamicAttributes()
    }

    public bindData() {
        if (this.bindExpression) {
            const isItContextVariable = this.bindExpression.startsWith('this.')
            // 5 is 'this.'.length
            const variableName = isItContextVariable ? this.bindExpression.slice(5) : this.bindExpression
            const node = this.getNode() as Element

            if (isItContextVariable) {
                const tagName = node.tagName.toLowerCase()
                let strategy: any

                if (tagName === 'input') {
                    const inputType = (node as HTMLInputElement).type.toLowerCase()

                    switch (inputType) {
                        case('text'):
                            strategy = InputTextStrategy
                            break
                    }
                }

                if (strategy) {
                    strategy = new strategy(this.bindExpression, variableName, this)
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
        if (this.hasBeenIfAttributeValueChanged) {
            this.setPresentState(presentState)

            if (this.getNode()) {
                if (this.isPresent()) {
                    this.attach()
                } else {
                    this.delete()
                }
            }
        }
    }

    public setPresentState(presentState: VirtualElementPresentState): void {
        this.presentState = presentState
    }

    public getPresentState(): VirtualElementPresentState {
        return this.presentState
    }

    protected makeNode(): Element | void {
        return document.createElement(this.parsedData.name)
    }

    protected isPresent(): boolean {
        return this.getPresentState() === VirtualElementPresentState.Present
    }
}
