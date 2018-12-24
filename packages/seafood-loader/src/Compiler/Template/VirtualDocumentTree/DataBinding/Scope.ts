import {REACTIVE_PROPERTY_FLAG} from "@seafood/app";
import "reflect-metadata";
import {ComponentScope} from "./ComponentScope";

export class Scope {
    /**
     * Array of objects which properties the element will use
     * to bind a data.
     */
    protected areas: any[];

    protected properties: any;

    protected componentScope?: ComponentScope;

    protected rerenderFunction?: (updatedExpressionValue: any) => void;
    protected executeFunction?: () => void;
    protected expressionGonnaBeExecuted: boolean = false;

    constructor() {
        this.areas = [];
        this.properties = [];
    }

    public setComponentScope(componentScope: ComponentScope): void {
        this.componentScope = componentScope;
    }

    public getComponentScope(): ComponentScope | undefined {
        return this.componentScope;
    }

    public setRerenderFunction(rerenderFunction: (updatedExpressionValue: any) => void) {
        this.rerenderFunction = rerenderFunction;
    }

    public setExecuteFunction(rerenderFunction: () => void) {
        this.executeFunction = rerenderFunction;
    }

    public enableExpressionGonnaBeExecuted(): void {
        this.expressionGonnaBeExecuted = true;
    }

    public disableExpressionGonnaBeExecuted(): void {
        this.expressionGonnaBeExecuted = false;
    }

    public isExpressionGonnaBeExecuted(): boolean {
        return this.expressionGonnaBeExecuted;
    }

    public executeExpression(expression: string, rerenderFunction: (updatedExpressionValue: any) => void): any {
        const componentScope = this.getComponentScope();
        const expressionFunction = this.makeExpressionFunction(expression);

        if (componentScope) {
            componentScope.enableExpressionGonnaBeExecuted();
            componentScope.setRerenderFunction(rerenderFunction);
            componentScope.setExecuteFunction(expressionFunction);
        }

        const expressionValue = this.bindExecuteFunctionContext(expressionFunction)();

        if (componentScope) {
            componentScope.disableExpressionGonnaBeExecuted();
        }

        return expressionValue;
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

    protected makeComponentInstanceReactive(inputValue: any): any {
        for (const fieldName in inputValue) {
            if (inputValue.hasOwnProperty(fieldName)) {
                const isReactive = Reflect.hasMetadata(REACTIVE_PROPERTY_FLAG, inputValue, fieldName);

                if (isReactive) {
                    this.addComponentFieldReactivity(fieldName, inputValue);
                }
            }
        }

        return inputValue;
    }

    protected addComponentFieldReactivity(fieldName: string, parentObject: any) {
        const fieldValue = parentObject[fieldName];

        if (typeof fieldValue === "object") {
            for (const fieldValueFieldName in fieldValue) {
                if (fieldValue.hasOwnProperty(fieldValueFieldName)) {
                    this.addComponentFieldReactivity(fieldValueFieldName, fieldValue);
                }
            }
        }

        this.defineFieldReactivity(fieldName, parentObject);
    }

    protected defineFieldReactivity(fieldName: string, parentObject: any) {
        const scopeContext = this;
        const property = {
            name: fieldName,
            value: parentObject[fieldName],
        };
        const reactivity = Reflect.getMetadata(
            REACTIVE_PROPERTY_FLAG,
            parentObject,
            fieldName,
        );
        Object.defineProperty(parentObject, fieldName, {
            get(): any {
                if (scopeContext.isExpressionGonnaBeExecuted()) {
                    if (reactivity &&
                        scopeContext.rerenderFunction &&
                        scopeContext.executeFunction &&
                        !reactivity.hasFunction(scopeContext.executeFunction)
                    ) {
                        const rerenderFunction = scopeContext.rerenderFunction;
                        const executeFunction = scopeContext.executeFunction;
                        reactivity.depend(() => {
                            rerenderFunction(scopeContext.bindExecuteFunctionContext(executeFunction)());
                        }, scopeContext.executeFunction);
                    }
                }

                return property.value;
            },
            set(value: any): void {
                property.value = value;
                reactivity.notify();
            },
        });
    }
}
