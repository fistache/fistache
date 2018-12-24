export const REACTIVE_PROPERTY_FLAG = "reactiveProperty";

interface IDependentFunction {
    depend: () => void;
    trigger: () => void;
}

export class ReactiveProperty {
    private readonly dependentFunctions: IDependentFunction[];

    constructor() {
        this.dependentFunctions = [];
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

    public notify() {
        for (const index in this.dependentFunctions) {
            if (this.dependentFunctions.hasOwnProperty(index)) {
                this.dependentFunctions[index].trigger();
            }
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
}
