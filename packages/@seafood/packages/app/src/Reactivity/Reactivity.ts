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
        Reflect.defineMetadata(REACTIVE_PROPERTY_FLAG, property, component, fieldName);

        if (parentReactivity) {
            property.setParent(parentReactivity);
        }

        if (typeof component[fieldName] === "object") {
            this.addReactivityToObtainableComponentFields(component[fieldName], property);
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
}
