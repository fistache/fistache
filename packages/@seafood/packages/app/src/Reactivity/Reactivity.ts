import {DECORATOR_UNREACTIVE_FLAG} from "@seafood/component";
import "reflect-metadata";
import {REACTIVE_PROPERTY_FLAG, ReactiveProperty} from "./ReactiveProperty";

export class Reactivity {
    public static addReactivityToObtainableComponentFields(component: any) {
        for (const fieldName in component) {
            if (component.hasOwnProperty(fieldName)) {
                const isObtainable = !Reflect.hasMetadata(DECORATOR_UNREACTIVE_FLAG, component, fieldName);
                if (isObtainable) {
                    const property = new ReactiveProperty();
                    Reflect.defineMetadata(REACTIVE_PROPERTY_FLAG, property, component, fieldName);

                    let fieldValue: any = component[fieldName];
                    Object.defineProperty(component, fieldName, {
                        get() {
                            return fieldValue;
                        },
                        set(value: any): void {
                            fieldValue = value;
                            property.notify();
                        },
                    });
                }

                if (typeof component[fieldName] === "object") {
                    this.addReactivityToObtainableComponentFields(component[fieldName]);
                }
            }
        }
    }
}
