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
        this.properties = this.computeAreaProperties(this.componentInstance);
        this.normalizedProperties = this.normalizeProperties(this.properties);
    }
}
