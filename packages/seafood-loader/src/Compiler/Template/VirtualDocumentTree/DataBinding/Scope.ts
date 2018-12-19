import {REACTIVE_PROPERTY_FLAG} from "@seafood/app";
import "reflect-metadata";
import {Property} from "./Property/Property";
import {ReactiveProperty} from "./Property/ReactiveProperty";

export class Scope {
    /**
     * Array of objects which properties the element will use
     * to bind a data.
     */
    protected areas: any[];

    constructor() {
        this.areas = [];
    }

    public extend(scope: Scope): void {
        this.areas = scope.getAreas();
    }

    public addArea(area: any): void {
        if (typeof area !== "object") {
            throw new Error(`The argument "area" is not an object.`);
        }

        this.areas.push(area);
    }

    public getAreas(): any[] {
        return this.areas;
    }

    public executeExpression(expression: string, rerenderFunction?: () => void): any {
        const properties = this.getProperties();
        const normalizedProperties: any[] = this.normalizeProperties(properties, rerenderFunction);
        const expressionFunction = this.makeExpressionFunction(normalizedProperties, expression);

        return expressionFunction();
    }

    protected makeExpressionFunction(normalizedProperties: any[], expression: string): () => void {
        return new Function(`return ${expression};`).bind(normalizedProperties);
    }

    protected normalizeProperties(properties: Property[], rerenderFunction?: () => void): any {
        const normilizedProperties: any[] = [];

        for (const property of properties) {
            const propertyName = property.getName() as any;
            normilizedProperties[propertyName] = property.getValue();

            if (property instanceof ReactiveProperty) {
                this.bindGetterForReactivityProperty(property, normilizedProperties);

                if (rerenderFunction) {
                    property.setRerenderFunction(rerenderFunction);
                }
            }
        }

        return normilizedProperties;
    }

    protected bindGetterForReactivityProperty(
        reactiveProperty: ReactiveProperty,
        normalizedProperties: any[],
    ): void {
        let isDependCalled = false;
        Object.defineProperty(normalizedProperties, reactiveProperty.getName(), {
            get(): any {
                if (!isDependCalled) {
                    const reactivity = Reflect.getMetadata(
                        REACTIVE_PROPERTY_FLAG,
                        reactiveProperty.getArea(),
                        reactiveProperty.getName(),
                    );

                    if (reactivity) {
                        const rerenderFunction = reactiveProperty.getRerenderFunction();

                        if (rerenderFunction) {
                            reactivity.depend(rerenderFunction);
                        }
                    }

                    isDependCalled = true;
                }

                return reactiveProperty.getArea()[reactiveProperty.getName()];
            },
        });
    }

    protected getProperties(): Property[] {
        const properties: Property[] = [];

        for (const area of this.areas) {
            Array.prototype.push.apply(
                properties,
                this.getAreaProperties(area),
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
}
