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

    protected expressionFunction?: () => void;

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

    public executeExpression(expression: string): any {
        const properties: any[] = this.normalizeProperties(this.getProperties());
        this.expressionFunction = this.makeExpressionFunction(properties, expression);

        return this.expressionFunction();
    }

    public getExpressionFunction(): (() => void) | undefined {
        return this.expressionFunction;
    }

    protected makeExpressionFunction(properties: any[], expression: string): () => void {
        const areas = this.getAreas();
        let thisContext = {};

        if (areas.length) {
            // First area is the component instance.
            thisContext = areas[0];
        }

        const func = function () {
            let finalExpression = "";

            for (const propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                    finalExpression += `var ${propertyName} = properties.${propertyName} \n`;
                }
            }

            finalExpression += `\n ${expression}`;
            return eval(finalExpression);
        };

        return func.bind(thisContext);
    }

    protected normalizeProperties(properties: Property[]): any {
        const normilizedProperties: any[] = [];

        for (const property of properties) {
            const propertyName = property.getName() as any;
            normilizedProperties[propertyName] = property.getValue();

            if (property instanceof ReactiveProperty) {
                this.bindGetterForReactivityProperty(property, normilizedProperties, propertyName);
            }
        }

        return normilizedProperties;
    }

    protected bindGetterForReactivityProperty(
        reactiveProperty: ReactiveProperty,
        normalizedProperties: any[],
        propertyName: string,
    ): void {
        const context = this;
        let propertyValue = normalizedProperties[propertyName as any];

        Object.defineProperty(normalizedProperties, propertyName, {
            get(): any {
                const reactivity = Reflect.getMetadata(
                    REACTIVE_PROPERTY_FLAG,
                    reactiveProperty.getArea(),
                    propertyName,
                );
                const expressionFunction = context.getExpressionFunction();

                if (reactivity && expressionFunction) {
                    reactivity.depend(expressionFunction);
                }

                return propertyValue;
            },
            set(value: any): void {
                propertyValue = value;
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
