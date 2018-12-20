import {REACTIVE_PROPERTY_FLAG} from "@seafood/app";
import "reflect-metadata";
import {ComponentScope} from "./ComponentScope";
import {Property} from "./Property/Property";
import {ReactiveProperty} from "./Property/ReactiveProperty";

export class Scope {
    /**
     * Array of objects which properties the element will use
     * to bind a data.
     */
    protected areas: any[];

    protected properties: any[];

    protected componentScope?: ComponentScope;

    protected parentScope?: Scope;

    protected rerenderFunction?: (updatedExpressionValue: any) => void;
    protected executeFunction?: () => void;

    constructor() {
        this.areas = [];
        this.properties = [];
    }

    public setComponentScope(componentScope: ComponentScope): void {
        this.componentScope = componentScope;
    }

    public setParentScope(scope: Scope): void {
        this.parentScope = scope;
        this.properties = this.computeProperties();
    }

    public getParentScope(): Scope | undefined {
        return this.parentScope;
    }

    public getComponentScope(): ComponentScope | undefined {
        return this.componentScope;
    }

    public addArea(area: any): void {
        if (typeof area !== "object") {
            throw new Error(`The argument "area" is not an object.`);
        }

        this.areas.push(area);
        this.mergeProperties(this.properties, this.computeAreaProperties(area));
    }

    public getAreas(): any[] {
        return this.areas;
    }

    public getProperties(): any[] {
        const properties: Property[] = [];
        const parentScope = this.getParentScope();

        if (parentScope) {
            this.mergeProperties(properties, parentScope.getProperties());
        }

        this.mergeProperties(properties, this.properties);

        return properties;
    }

    public setRerenderFunction(rerenderFunction: (updatedExpressionValue: any) => void) {
        this.rerenderFunction = rerenderFunction;
    }

    public setExecuteFunction(rerenderFunction: () => void) {
        this.executeFunction = rerenderFunction;
    }

    public executeExpression(expression: string, rerenderFunction: (updatedExpressionValue: any) => void): any {
        const componentScope = this.getComponentScope();
        const expressionFunction = this.makeExpressionFunction(expression);

        if (componentScope) {
            componentScope.setRerenderFunction(rerenderFunction);
            componentScope.setExecuteFunction(expressionFunction);
        }

        return this.bindExecuteFunctionContext(expressionFunction)();
    }

    protected computeAreaProperties(area: any): any[] {
        return this.getAreaProperties(area);
    }

    protected makeExpressionFunction(expression: string): () => void {
        return new Function(`return ${expression};`) as () => void;
    }

    protected bindExecuteFunctionContext(executeFunction: () => void): () => void {
        let context = {};

        if (this.componentScope) {
            context = this.componentScope.getNormalizedProperties();
        }

        return executeFunction.bind(context);
    }

    protected normalizeProperties(properties: Property[], nested: boolean = false): any {
        const normilizedProperties: any[] = [];

        for (const property of properties) {
            const propertyName = property.getName() as any;
            const propertyValue = property.getValue();

            normilizedProperties[propertyName] = propertyValue;

            if (nested || property instanceof ReactiveProperty) {
                if (typeof propertyValue === "object") {
                    for (const childReactiveProperty of propertyValue) {
                        this.normalizeProperties(childReactiveProperty, true);
                    }
                }

                console.log(propertyName, propertyValue);
                this.bindGetterForReactivityProperty(property as ReactiveProperty, normilizedProperties);
            }
        }

        return normilizedProperties;
    }

    protected bindGetterForReactivityProperty(
        reactiveProperty: ReactiveProperty,
        normalizedProperties: any[],
    ): void {
        const scopeContext = this;
        Object.defineProperty(normalizedProperties, reactiveProperty.getName(), {
            get(): any {
                const reactivity = Reflect.getMetadata(
                    REACTIVE_PROPERTY_FLAG,
                    reactiveProperty.getArea(),
                    reactiveProperty.getName(),
                );

                if (reactivity &&
                    scopeContext.rerenderFunction &&
                    scopeContext.executeFunction &&
                    !reactivity.hasFunction(scopeContext.executeFunction)
                ) {
                    const rerenderFunction = scopeContext.rerenderFunction;
                    const executeFunction = scopeContext.executeFunction;
                    reactivity.depend(() => {
                        console.log(
                            `The value of "${reactiveProperty.getName()}" was set to`,
                            reactiveProperty.getArea()[reactiveProperty.getName()],
                        );
                    });
                    reactivity.depend(() => {
                        rerenderFunction(scopeContext.bindExecuteFunctionContext(executeFunction)());
                    });
                }

                return reactiveProperty.getArea()[reactiveProperty.getName()];
            },
            set(value: any): void {
                reactiveProperty.setValue(value);
            },
        });
    }

    protected computeProperties(): Property[] {
        const properties: Property[] = [];

        for (const area of this.getAreas()) {
            Array.prototype.push.apply(
                properties,
                this.computeAreaProperties(area),
            );
        }

        return properties;
    }

    protected getAreaProperties(area: any, nested: boolean = false): Property[] {
        const properties: Property[] = [];

        for (const propertyName in area) {
            if (area.hasOwnProperty(propertyName)) {
                let propertyValue = area[propertyName];
                const isReactive = Reflect.hasMetadata(REACTIVE_PROPERTY_FLAG, area, propertyName);
                let property;

                if (nested || isReactive) {
                    if (typeof propertyValue === "object") {
                        propertyValue = this.getAreaProperties(propertyValue, true);
                    }

                    property = new ReactiveProperty(propertyName, propertyValue, area);
                } else {
                    property = new Property(propertyName, propertyValue);
                }

                properties.push(property);
            }
        }

        return properties;
    }

    private mergeProperties(into: any[], from: any[]): void {
        for (const propertyName in from) {
            if (from.hasOwnProperty(propertyName)) {
                if (into.hasOwnProperty(propertyName)) {
                    console.warn(`Dubplicate declaration of "${propertyName}" variable.`);
                } else {
                    into[propertyName] = from[propertyName];
                }
            }
        }
    }
}
