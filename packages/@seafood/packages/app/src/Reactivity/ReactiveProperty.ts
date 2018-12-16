export const REACTIVE_PROPERTY_FLAG = "reactiveProperty";

export class ReactiveProperty {
    private readonly dependentFunctions: Array<() => void>;

    constructor() {
        this.dependentFunctions = [];
    }

    public depend(dependentFunction: () => void) {
        if (dependentFunction && !this.dependentFunctions.includes(dependentFunction)) {
            this.dependentFunctions.push(dependentFunction);
        }
    }

    public notify() {
        for (const index in this.dependentFunctions) {
            if (this.dependentFunctions.hasOwnProperty(index)) {
                this.dependentFunctions[index]();
            }
        }
    }
}
