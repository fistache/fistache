export type ExecutingFunction = () => void
export type UpdatingFunction = (depth?: number) => void

export class ReactiveProperty {
    private readonly functions = new Map<ExecutingFunction, UpdatingFunction>()
    private parent?: ReactiveProperty
    private readonly children = new Set<ReactiveProperty>()

    public notify(depth: number = 0) {
        for (const updatingFunction of this.functions.values()) {
            updatingFunction(depth)
        }
    }

    public notifyParent(depth: number = 0) {
        this.notify(depth)

        if (this.parent) {
            this.parent.notifyParent(++depth)
        }
    }

    public notifyParentAndChildren(depth: number = 0) {
        this.notifyParent(depth)
        this.notifyChildren()
    }

    public notifyChildren() {
        for (const updatingFunction of this.getUniqueChildrenUpdatingFunctions()) {
            updatingFunction()
        }
    }

    public setParent(parent: ReactiveProperty) {
        this.parent = parent
    }

    public removeParent() {
        this.parent = undefined
    }

    public addChild(child: ReactiveProperty) {
        this.children.add(child)
    }

    public deleteChild(child: ReactiveProperty) {
        this.children.delete(child)
    }

    public addFunction(executingFunction: ExecutingFunction, updatingFunction: UpdatingFunction) {
        this.functions.set(executingFunction, updatingFunction)
    }

    public hasFunction(executingFunction: ExecutingFunction) {
        return this.functions.has(executingFunction)
    }

    public getFunctions(): Map<ExecutingFunction, UpdatingFunction> {
        return this.functions
    }

    public getUniqueChildrenUpdatingFunctions(updatingFunctions?: Set<UpdatingFunction>): Set<UpdatingFunction> {
        if (!updatingFunctions) {
            updatingFunctions = new Set<UpdatingFunction>()
        }

        for (const child of this.children) {
            for (const updatingFunction of child.getFunctions().values()) {
                updatingFunctions.add(updatingFunction)
            }
            child.getUniqueChildrenUpdatingFunctions(updatingFunctions)
        }

        return updatingFunctions
    }
}
