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
        this.notify()

        if (this.parent) {
            this.parent.notifyParent(++depth)
        }
    }

    public notifyParentAndChildren(depth: number = 0) {
        this.notifyParent(depth)
        this.notifyChildren()
    }

    public notifyChildren() {
        for (const functions of this.getUniqueChildrenUpdatingFunctions()) {
            functions[1]()
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

    public getUniqueChildrenUpdatingFunctions(
        map?: Map<ExecutingFunction,
            UpdatingFunction>
    ): Map<ExecutingFunction, UpdatingFunction> {
        if (!map) {
            map = new Map<ExecutingFunction, UpdatingFunction>()
        }

        for (const child of this.children) {
            for (const functions of child.getFunctions()) {
                map.set(functions[0], functions[1])
            }
            child.getUniqueChildrenUpdatingFunctions(map)
        }

        return map
    }
}
