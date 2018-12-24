import {Scope} from "./Scope";

export class ComponentScope extends Scope {
    protected componentInstance: any;

    protected normalizedProperties: any[];

    constructor() {
        super();
        this.normalizedProperties = [];
    }

    public setComponentInstance(componentInstance: any): void {
        this.componentInstance = componentInstance;
    }

    public getComponentInstance(): any {
        return this.componentInstance;
    }

    public getNormalizedProperties(): any[] {
        return this.normalizedProperties;
    }

    public bindNormalizedProperties(): void {
        // this.properties = this.computeAreaProperties(this.componentInstance);
        // console.log(this.properties);
        // this.normalizedProperties = this.normalizeProperties(this.properties);
        this.normalizedProperties = this.makeComponentInstanceReactive(this.componentInstance);
    }

    protected bindExecuteFunctionContext(executeFunction: () => void): () => void {
        let context = {};

        if (this.componentInstance) {
            context = this.componentInstance;
        }

        return executeFunction.bind(context);
    }
}
