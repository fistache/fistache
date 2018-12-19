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

    public executeExpression(expression: string, rerenderFunction: () => void): any {
        const expressionFunction = this.makeExpressionFunction(expression);

        return expressionFunction();
    }

    protected computeAreaProperties(area: any): any[] {
        return this.getAreaProperties(area);
    }

    protected makeExpressionFunction(expression: string): () => void {
        let context = {};

        if (this.componentScope) {
            context = this.componentScope.getNormalizedProperties();
        }

        return new Function(`return ${expression};`).bind(context);
    }

    protected normalizeProperties(properties: Property[], rerenderFunction?: () => void): any {
        const normilizedProperties: any[] = [];

        for (const property of properties) {
            const propertyName = property.getName() as any;
            normilizedProperties[propertyName] = property.getValue();

            if (property instanceof ReactiveProperty) {
                // if (rerenderFunction) {
                //     property.setRerenderFunction(rerenderFunction);
                // }

                this.bindGetterForReactivityProperty(property, normilizedProperties);
            }
        }

        return normilizedProperties;
    }

    protected bindGetterForReactivityProperty(
        reactiveProperty: ReactiveProperty,
        normalizedProperties: any[],
    ): void {
        Object.defineProperty(normalizedProperties, reactiveProperty.getName(), {
            get(): any {
                const reactivity = Reflect.getMetadata(
                    REACTIVE_PROPERTY_FLAG,
                    reactiveProperty.getArea(),
                    reactiveProperty.getName(),
                );

                if (reactivity) {
                    // reactivity.depend(reactiveProperty.getRerenderFunction);
                    reactivity.depend(() => {
                        console.log(`The value of "${reactiveProperty.getName()}" variable was updated.`);
                    });
                }

                console.log("reactive property: ", reactiveProperty.getName());

                return reactiveProperty.getArea()[reactiveProperty.getName()];
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

    protected getAreaProperties(area: any): Property[] {
        const properties: Property[] = [];

        for (const propertyName in area) {
            if (area.hasOwnProperty(propertyName)) {
                const propertyValue = area[propertyName];
                const isReactive = Reflect.hasMetadata(REACTIVE_PROPERTY_FLAG, area, propertyName);

                if (isReactive) {
                    properties.push(
                        new ReactiveProperty(propertyName, propertyValue, area),
                    );
                } else {
                    properties.push(
                        new Property(propertyName, propertyValue),
                    );
                }
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
