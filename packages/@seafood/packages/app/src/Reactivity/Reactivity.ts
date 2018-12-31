import {DECORATOR_UNREACTIVE_FLAG} from "@seafood/component";
import "reflect-metadata";
import {REACTIVE_PROPERTY_FLAG, ReactiveProperty} from "./ReactiveProperty";
import {ReactivityWatcher} from "./ReactivityWatcher";

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
    ): ReactiveProperty {
        const reactiveProperty = new ReactiveProperty();

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

    public static completeObject(obj: any, parentReactiveProperty?: ReactiveProperty): void {
        for (const propertyKey in obj) {
            if (obj.hasOwnProperty(propertyKey) && !this.isReactiveProperty(obj, propertyKey)) {
                this.applyObjectProperty(obj, propertyKey, parentReactiveProperty, true);
            }
        }
    }

    public static makeProxyObject(
        obj: any,
        reactiveProperty: ReactiveProperty,
    ): any {
        return new Proxy(obj, {
            get: (target: any, targetPropertyKey: PropertyKey) => {
                this.watch(reactiveProperty);

                return target[targetPropertyKey];
            },
            set: (target: any, targetPropertyKey: PropertyKey, value: any): boolean => {
                if (target.hasOwnProperty(targetPropertyKey)) {
                    if (Array.isArray(target) && targetPropertyKey === "length") {
                        target[targetPropertyKey] = value;
                        reactiveProperty.notify(0, false);
                    } else {
                        // const reactiveValue = {[targetPropertyKey.toString()]: value};
                        // this.merge(
                        //     target,
                        //     reactiveValue,
                        //     targetPropertyKey.toString(),
                        //     parentReactiveProperty,
                        // );
                        target[targetPropertyKey] = value;

                        const targetReactiveProperty = this.getObjectProperty(target, targetPropertyKey.toString());
                        if (targetReactiveProperty) {
                            targetReactiveProperty.notify();
                        }
                    }
                } else {
                    // console.log(targetPropertyKey, reactiveProperty);
                    target[targetPropertyKey] = value;
                    // this.completeObject(obj, parentReactiveProperty);
                    this.applyObjectProperty(obj, targetPropertyKey.toString(), reactiveProperty, true);
                    reactiveProperty.notify(0, false);
                }

                return true;
            },
        });
    }

    public static merge(from: any, to: any, propertyKey: string, reactiveProperty?: ReactiveProperty): void {
        const fromValue = from && from[propertyKey];
        const toValue = to[propertyKey];

        if (reactiveProperty) {
            this.defineObjectProperty(to, propertyKey, reactiveProperty);
        } else {
            this.applyObjectProperty(to, propertyKey);
        }

        if (typeof toValue === "object") {
            for (const toValuePropertyKey in toValue) {
                if (toValue.hasOwnProperty(toValuePropertyKey)) {
                    let toValueReactiveProperty;

                    if (fromValue && fromValue.hasOwnProperty(toValuePropertyKey)) {
                        toValueReactiveProperty = this.getObjectProperty(fromValue, toValuePropertyKey);
                    }

                    this.merge(fromValue, toValue, toValuePropertyKey, toValueReactiveProperty);
                }
            }
        }
    }

    public static watch(reactiveProperty: ReactiveProperty): void {
        const reactivityWatcher = ReactivityWatcher.getInstance();

        if (reactivityWatcher.isRecording() && reactiveProperty) {
            const updatingFunction = reactivityWatcher.getUpdatingFunction();
            const executingFunction = reactivityWatcher.getExecutingFunction();
            const variables = reactivityWatcher.getVariables();

            if (updatingFunction && executingFunction && variables) {
                const executingFunctionWithContext = reactivityWatcher.bindContext(executingFunction);
                const variableValues = Object.values(variables);

                reactiveProperty.depend((depth?: number) => {
                    updatingFunction(executingFunctionWithContext(
                        ...variableValues,
                    ), depth);
                });
            }
        }
    }

    public static getObject(obj: any): ReactiveProperty {
        return Reflect.getMetadata(REACTIVE_PROPERTY_FLAG, obj);
    }

    public static getObjectProperty(obj: any, propertyKey: string): ReactiveProperty {
        return Reflect.getMetadata(REACTIVE_PROPERTY_FLAG, obj, propertyKey);
    }

    public static defineObject(obj: any, reactiveProperty: ReactiveProperty): void {
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
