export const REACTIVE_PROPERTY_FLAG = "reactiveProperty";

interface DependentFunction {
    depend: () => void;
    trigger: (depth?: number) => void;
}

export class ReactiveProperty {
    private readonly dependentFunctions: DependentFunction[];
    private parentReactiveProperty?: ReactiveProperty | null;
    private readonly childReactiveProperties: ReactiveProperty[];

    constructor() {
        this.childReactiveProperties = [];
        this.dependentFunctions = [];
    }

    public setParentReactiveProperty(parent: ReactiveProperty): void {
        this.parentReactiveProperty = parent;
        this.parentReactiveProperty.addChildReactiveProperty(this);
    }

    public addChildReactiveProperty(child: ReactiveProperty): void {
        // todo: find a reason why includes method devides count of
        // childs by half 14 -> 7
        if (!this.childReactiveProperties.includes(child)) {
            this.childReactiveProperties.push(child);
        }
    }

    public removeDepedent(functions: Array<() => void>): void {
        // todo: optimize
        for (const func of functions) {
            for (const index in this.dependentFunctions) {
                if (this.dependentFunctions[index].depend === func) {
                    this.dependentFunctions.splice(+index, 1);
                    break;
                }
            }
        }
    }

    public depend(trigger: () => void, depend?: () => void) {
        depend = depend || trigger;
        if (trigger && !this.hasFunction(depend)) {
            this.dependentFunctions.push({
                depend,
                trigger,
            });
        }
    }

    public notify(depth: number = 0, shouldNotifyChild: boolean = true) {
        for (const dependentFunction of this.dependentFunctions) {
            dependentFunction.trigger(depth);
        }

        if (this.parentReactiveProperty) {
            this.parentReactiveProperty.notify(++depth, false);
        }

        if (shouldNotifyChild) {
            this.notifyChildReactiveProperties();
        }
    }

    public notifyParentVirtualNodes(depth?: number): void {
        if (!depth) {
            depth = 0;
        }

        for (const dependentFunction of this.dependentFunctions) {
            dependentFunction.trigger(depth);
        }

        if (this.parentReactiveProperty) {
            this.parentReactiveProperty.notifyParentVirtualNodes(++depth);
        }
    }

    public notifyChildReactiveProperties(): void {
        const functionsToTrigger = this.getChildReactivePropertyTriggerFunctions();
        const uniqueFunctionsToTrigger: DependentFunction[] = functionsToTrigger.reduce(
            (x: DependentFunction[], y: DependentFunction) =>
                x.findIndex((e: DependentFunction) => e.depend === y.depend) < 0 ? [...x, y] : x, [],
        );

        for (const uniqueFunction of uniqueFunctionsToTrigger) {
            uniqueFunction.trigger();
        }
    }

    public hasFunction(dependentFunction: () => void): boolean {
        for (const dep of this.dependentFunctions) {
            if (dep.depend === dependentFunction) {
                return true;
            }
        }
        return false;
    }

    public getDependentFunctions(): DependentFunction[] {
        return this.dependentFunctions;
    }

    public getChildReactiveProperties(): ReactiveProperty[] {
        return this.childReactiveProperties;
    }

    public getChildReactivePropertyTriggerFunctions(): DependentFunction[] {
        const functionsToTrigger: DependentFunction[] = [];

        for (const childProperty of this.getChildReactiveProperties()) {
            const childDependentFunctions = childProperty.getDependentFunctions();
            for (const dependentFunction of childDependentFunctions) {
                functionsToTrigger.push(dependentFunction);
            }
            functionsToTrigger.push(...childProperty.getChildReactivePropertyTriggerFunctions());
        }

        return functionsToTrigger;
    }
}
