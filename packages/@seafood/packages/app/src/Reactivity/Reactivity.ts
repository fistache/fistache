import {DECORATOR_UNREACTIVE_FLAG} from "@seafood/component";
import "reflect-metadata";
import {REACTIVE_PROPERTY_FLAG, ReactiveProperty} from "./ReactiveProperty";

export class Reactivity {
    public static addReactivityToObtainableComponentFields(component: any, parentReactivity?: ReactiveProperty) {
        for (const fieldName in component) {
            if (component.hasOwnProperty(fieldName)) {
                const isObtainable = !Reflect.hasMetadata(DECORATOR_UNREACTIVE_FLAG, component, fieldName);
                if (parentReactivity || isObtainable) {
                    Reactivity.addReactivityToComponentSpecifiedField(component, fieldName, parentReactivity);
                }
            }
        }
    }

    public static addReactivityToComponentSpecifiedField(
        component: any,
        fieldName: string,
        parentReactivity?: ReactiveProperty,
    ): void {
        const property = new ReactiveProperty();
        let componentValue = component[fieldName];
        Reflect.defineMetadata(REACTIVE_PROPERTY_FLAG, property, component, fieldName);

        if (parentReactivity) {
            property.setParent(parentReactivity);
        }

        if (typeof componentValue === "object") {
            // console.log(component, fieldName);
            componentValue = new Proxy(componentValue, {
                get(target: any, p: PropertyKey): any {
                    // console.log(p);

                    return target[p];
                },
                set(target: any, p: PropertyKey, value: any): boolean {
                    console.log(p, value);
                    target[p] = value;
                    return true;
                },
            });

            this.addReactivityToObtainableComponentFields(componentValue, property);
        }
    }

    public static merge(from: any, to: any, field: string, reactiveProperty?: ReactiveProperty): void {
        const fromValue = from && from[field];
        const toValue = to[field];

        if (reactiveProperty) {
            Reflect.defineMetadata(REACTIVE_PROPERTY_FLAG, reactiveProperty, to, field);
        } else {
            Reactivity.addReactivityToComponentSpecifiedField(to, field);
        }

        if (typeof toValue === "object") {
            for (const fieldName in toValue) {
                if (toValue.hasOwnProperty(fieldName)) {
                    let reactiveProp;

                    if (fromValue && fromValue.hasOwnProperty(fieldName)) {
                        reactiveProp = Reflect.getMetadata(REACTIVE_PROPERTY_FLAG, fromValue, fieldName);
                    }

                    this.merge(fromValue, toValue, fieldName, reactiveProp);
                }
            }
        }
    }

    public static updateReactivityOnArrayItems(arr: any[], parentReactiveProperty?: ReactiveProperty): void {
        for (const fieldName in arr) {
            if (arr.hasOwnProperty(fieldName)) {
                const isReactive = Reflect.hasMetadata(REACTIVE_PROPERTY_FLAG, arr, fieldName);
                if (!isReactive) {
                    Reactivity.addReactivityToComponentSpecifiedField(arr, fieldName, parentReactiveProperty);
                }
            }
        }
    }

    public static watchArrayChanges(
        callback: (arr: any[]) => void,
        arr: any[],
        reactiveProperty: ReactiveProperty,
    ): void {
        // const methods: any[] = [
        //     "push", "pop", "shift", "unshift", "splice", "reverse", "fill", "sort",
        // ];

        // for (const method of methods) {
        //     Object.defineProperty(arr, method, {
        //         value() {
        //             const result: any[] = Array.prototype[method].apply(this, arguments);
        //             callback(this);
        //             reactiveProperty.notify();
        //
        //             return result;
        //         },
        //     });
        // }
    }
}
