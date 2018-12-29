export const REACTIVE_PROPERTY_FLAG = "reactiveProperty";

interface DependentFunction {
    depend: () => void;
    trigger: () => void;
}

export class ReactiveProperty {
    private readonly dependentFunctions: DependentFunction[];
    private parent?: ReactiveProperty;
    private readonly childProperties: ReactiveProperty[];

    constructor() {
        this.childProperties = [];
        this.dependentFunctions = [];
    }

    public setParent(parent: ReactiveProperty): void {
        this.parent = parent;
        this.parent.addChild(this);
    }

    public addChild(child: ReactiveProperty): void {
        this.childProperties.push(child);
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

    public notify(shouldNotifyChild: boolean = true) {
        for (const dependentFunction of this.dependentFunctions) {
            dependentFunction.trigger();
        }

        if (this.parent) {
            this.parent.notify(false);
        }

        if (shouldNotifyChild) {
            this.notifyAllChildProperties();
        }
    }

    public notifyAllChildProperties(): void {
        const functionsToTrigger = this.getChildPropertiesFunctionsToTrigger();
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

    public getChildProperties(): ReactiveProperty[] {
        return this.childProperties;
    }

    public getChildPropertiesFunctionsToTrigger(): DependentFunction[] {
        const functionsToTrigger: DependentFunction[] = [];

        for (const childProperty of this.getChildProperties()) {
            const childDependentFunctions = childProperty.getDependentFunctions();
            for (const dependentFunction of childDependentFunctions) {
                functionsToTrigger.push(dependentFunction);
            }
            functionsToTrigger.push(...childProperty.getChildPropertiesFunctionsToTrigger());
        }

        return functionsToTrigger;
    }
}
