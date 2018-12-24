import {REACTIVE_PROPERTY_FLAG} from "@seafood/app";
import "reflect-metadata";
import {ComponentScope} from "./ComponentScope";

export class Scope {
    /**
     * Array of objects which properties the element will use
     * to bind a data.
     */
    protected variables: any;

    protected properties: any;

    protected componentScope?: ComponentScope;
    protected parentScope?: Scope;

    protected rerenderFunction?: (updatedExpressionValue: any) => void;
    protected executeFunction?: () => void;
    protected expressionGonnaBeExecuted: boolean = false;
    protected executionVariables: any;

    constructor() {
        this.variables = {};
        this.properties = [];
    }

    public setComponentScope(componentScope: ComponentScope): void {
        this.componentScope = componentScope;
    }

    public getVariables(): any {
        return this.variables;
    }

    public setParentScope(scope: Scope): void {
        this.parentScope = scope;
    }

    public getParentScope(): Scope | undefined {
        return this.parentScope;
    }

    public getComponentScope(): ComponentScope | undefined {
        return this.componentScope;
    }

    public setVariable(name: string, value: any): void {
        this.variables[name] = value;
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

    public setExecutionVariables(executionVariables: any): void {
        this.executionVariables = executionVariables;
    }

    public getExecutionVariables(): any {
        return this.executionVariables;
    }

    public executeExpression(expression: string, rerenderFunction: (updatedExpressionValue: any) => void): any {
        const extendedVariables = this.getExtendedVariables();
        const componentScope = this.getComponentScope();
        const expressionFunction = this.makeExpressionFunction(expression, Object.keys(extendedVariables));

        if (componentScope) {
            componentScope.enableExpressionGonnaBeExecuted();
            componentScope.setRerenderFunction(rerenderFunction);
            componentScope.setExecuteFunction(expressionFunction);
            componentScope.setExecutionVariables(extendedVariables);
        }

        const expressionValue = this.bindExecuteFunctionContext(expressionFunction)(
            ...Object.values(extendedVariables),
        );

        if (componentScope) {
            componentScope.disableExpressionGonnaBeExecuted();
        }

        return expressionValue;
    }

    protected getExtendedVariables(): any[] {
        const extendedVariables: any = {};
        let scope: Scope | undefined = this;

        while (scope) {
            const variables = scope.getVariables();

            for (const variableName in variables) {
                if (variables.hasOwnProperty(variableName)) {
                    const variableValue = variables[variableName];

                    if (extendedVariables.hasOwnProperty(variableName)) {
                        console.warn(
                            `Duplicate declaration of ${variableName} in template. `
                            + `The value of this variable will be overriten.`,
                        );
                    }

                    extendedVariables[variableName] = variableValue;
                }
            }

            scope = scope.getParentScope();
        }

        return extendedVariables;
    }

    protected makeExpressionFunction(expression: string, args: any[]): (...args: any[]) => void {
        return new Function(...args, `return ${expression};`) as (...args: any[]) => void;
    }

    protected bindExecuteFunctionContext(executeFunction: () => void): (...args: any) => void {
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
                        const executionVariables = scopeContext.getExecutionVariables();
                        reactivity.depend(() => {
                            rerenderFunction(
                                scopeContext.bindExecuteFunctionContext(executeFunction)(
                                    ...Object.values(executionVariables),
                                ),
                            );
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
