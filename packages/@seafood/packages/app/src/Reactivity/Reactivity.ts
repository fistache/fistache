import {DECORATOR_UNREACTIVE_FLAG} from "@seafood/component";
import "reflect-metadata";
import {REACTIVE_PROPERTY_FLAG, ReactiveProperty} from "./ReactiveProperty";
import {ReactivityWatcher} from "./ReactivityWatcher";

export const PROXY_TARGET_SYMBOL = Symbol("ProxyTarget");

export class Reactivity {
    public static applyComponent(component: any): void {
        for (const propertyKey in component) {
            if (component.hasOwnProperty(propertyKey)
                && !Reflect.hasMetadata(DECORATOR_UNREACTIVE_FLAG, component, propertyKey)
            ) {
                const reactiveProperty = this.applyObjectProperty(component, propertyKey);
                this.applyComponentProperty(component, propertyKey, reactiveProperty);
            }
        }
    }

    public static applyComponentProperty(obj: any, propertyKey: string, reactiveProperty: ReactiveProperty) {
        const property = {
            value: obj[propertyKey],
        };

        Object.defineProperty(obj, propertyKey, {
            get: (): any => {
                this.watch(reactiveProperty);

                return property.value;
            },
            set: (value: any): void => {
                const reactiveValue = {
                    [propertyKey]: value,
                };

                this.merge(obj, reactiveValue, propertyKey, reactiveProperty);
                property.value = reactiveValue[propertyKey];
                reactiveProperty.notify();
            },
        });

        if (propertyKey === "objects") {
            console.log(reactiveProperty);
        }
    }

    public static applyObjectProperties(obj: any, parentReactiveProperty: ReactiveProperty): void {
        for (const propertyKey in obj) {
            if (obj.hasOwnProperty(propertyKey)) {
                this.applyObjectProperty(obj, propertyKey, parentReactiveProperty);
            }
        }
    }

    public static applyObject(
        obj: any,
        propertyKey: string,
        parentReactiveProperty?: ReactiveProperty,
        reactiveProperty?: ReactiveProperty,
    ): ReactiveProperty {
        if (!reactiveProperty) {
            reactiveProperty = new ReactiveProperty();
        }

        if (parentReactiveProperty) {
            reactiveProperty.setParentReactiveProperty(parentReactiveProperty);
        }

        this.defineObjectProperty(obj, propertyKey, reactiveProperty);

        return reactiveProperty;
    }

    public static applyObjectProperty(
        obj: any,
        propertyKey: string,
        parentReactiveProperty?: ReactiveProperty,
        isComlete?: boolean,
    ): ReactiveProperty {
        const propertyValue = obj[propertyKey];
        const reactiveProperty = this.applyObject(obj, propertyKey, parentReactiveProperty);

        if (typeof propertyValue === "object") {
            this.applyObjectProperties(obj[propertyKey], reactiveProperty);

            if (!isComlete) {
                obj[propertyKey] = this.makeProxyObject(obj[propertyKey], reactiveProperty);
            }
        }

        return reactiveProperty;
    }

    public static makeProxyObject(
        obj: any,
        reactiveProperty: ReactiveProperty,
    ): any {
        let ignoreNextLengthSetNotify = false;

        return new Proxy(obj, {
            get: (target: any, targetPropertyKey: PropertyKey) => {
                if (targetPropertyKey === PROXY_TARGET_SYMBOL) {
                    return target;
                }

                this.watch(this.getObjectProperty(target, targetPropertyKey as string));

                return target[targetPropertyKey];
            },
            set: (target: any, targetPropertyKey: PropertyKey, value: any): boolean => {
                if (target.hasOwnProperty(targetPropertyKey)) {
                    if (Array.isArray(target) && targetPropertyKey === "length") {
                        target[targetPropertyKey] = value;

                        if (!ignoreNextLengthSetNotify) {
                            reactiveProperty.notifyParentVirtualNodes();
                        }
                        ignoreNextLengthSetNotify = false;
                    } else {
                        const reactiveValue = {
                            [targetPropertyKey]: value,
                        };

                        this.merge(target, reactiveValue, targetPropertyKey as string, reactiveProperty);

                        target[targetPropertyKey] = reactiveValue[targetPropertyKey as string];

                        const targetReactiveProperty = this.getObjectProperty(target, targetPropertyKey as string);
                        if (targetReactiveProperty) {
                            targetReactiveProperty.notify();
                        }
                    }
                } else {
                    ignoreNextLengthSetNotify = true;
                    target[targetPropertyKey] = value;
                    this.applyObjectProperty(obj, targetPropertyKey.toString(), reactiveProperty);
                    reactiveProperty.notifyParentVirtualNodes();
                }

                return true;
            },
        });
    }

    public static merge(
        from: any,
        to: any,
        propertyKey: string,
        reactiveProperty?: ReactiveProperty,
        parentReactiveProperty?: ReactiveProperty,
    ): void {
        const fromValue = from && from[propertyKey];
        const toValue = to[propertyKey];

        reactiveProperty = this.applyObject(to, propertyKey, parentReactiveProperty, reactiveProperty);

        if (typeof toValue === "object") {
            for (const toValuePropertyKey in toValue) {
                if (toValue.hasOwnProperty(toValuePropertyKey)) {
                    let toValueReactiveProperty;

                    if (fromValue && fromValue.hasOwnProperty(toValuePropertyKey)) {
                        toValueReactiveProperty = this.getObjectProperty(fromValue, toValuePropertyKey);
                    } else {
                        toValueReactiveProperty = this.applyObject(toValue, toValuePropertyKey, reactiveProperty);
                    }

                    this.merge(fromValue, toValue, toValuePropertyKey, toValueReactiveProperty, reactiveProperty);
                }
            }
            to[propertyKey] = this.makeProxyObject(to[propertyKey], reactiveProperty);
        }
    }

    public static watch(reactiveProperty: ReactiveProperty): void {
        const reactivityWatcher = ReactivityWatcher.getInstance();

        if (reactiveProperty && reactivityWatcher.isRecording()) {
            const updatingFunction = reactivityWatcher.getUpdatingFunction();
            const executingFunction = reactivityWatcher.getExecutingFunction();
            const variables = reactivityWatcher.getVariables();

            if (updatingFunction && executingFunction && variables
                && !reactiveProperty.hasFunction(executingFunction)
            ) {
                const executingFunctionWithContext = reactivityWatcher.bindContext(executingFunction);
                const variableValues = Object.values(variables);
                const scope = reactivityWatcher.getScope();

                if (scope) {
                    scope.addDependent(reactiveProperty, executingFunction);
                }

                reactiveProperty.depend((depth?: number) => {
                    updatingFunction(executingFunctionWithContext(
                        ...variableValues,
                    ), depth);
                }, executingFunction);
            }
        }
    }

    public static resetObjectProperties(obj: any, propertyKey: string): void {
        Reflect.deleteMetadata(REACTIVE_PROPERTY_FLAG, obj, propertyKey);

        if (typeof obj[propertyKey] === "object") {
            for (const targetPropertyKey in obj[propertyKey]) {
                if (obj[propertyKey].hasOwnProperty(targetPropertyKey)) {
                    this.resetObjectProperties(obj[propertyKey], targetPropertyKey);
                }
            }
        }
    }

    public static getObject(obj: any): ReactiveProperty {
        return Reflect.getMetadata(REACTIVE_PROPERTY_FLAG, obj);
    }

    public static getObjectProperty(obj: any, propertyKey: string | symbol): ReactiveProperty {
        if (obj[PROXY_TARGET_SYMBOL]) {
            obj = obj[PROXY_TARGET_SYMBOL];
        }

        return Reflect.getMetadata(REACTIVE_PROPERTY_FLAG, obj, propertyKey);
    }

    public static defineObject(obj: any, reactiveProperty: ReactiveProperty): void {
        if (obj[PROXY_TARGET_SYMBOL]) {
            obj = obj[PROXY_TARGET_SYMBOL];
        }

        Reflect.defineMetadata(REACTIVE_PROPERTY_FLAG, reactiveProperty, obj);
    }

    public static defineObjectProperty(obj: any, propertyKey: string, reactiveProperty: ReactiveProperty): void {
        Reflect.defineMetadata(REACTIVE_PROPERTY_FLAG, reactiveProperty, obj, propertyKey);
    }

    public static isReactive(obj: any): boolean {
        return Reflect.hasMetadata(REACTIVE_PROPERTY_FLAG, obj);
    }

    public static isReactiveProperty(obj: any, propertyKey: string): boolean {
        return Reflect.hasMetadata(REACTIVE_PROPERTY_FLAG, obj, propertyKey);
    }
}
