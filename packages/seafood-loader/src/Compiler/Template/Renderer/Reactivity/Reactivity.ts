import { DECORATOR_UNREACTIVE_FLAG } from '@seafood/component'
import { ReactiveObject } from './ReactiveObject'
// import { ReactivityWatcher } from './ReactivityWatcher'

export const PROXY_TARGET_SYMBOL = Symbol('ProxyTarget')

export class Reactivity {
    private readonly component: any
    private log = new WeakMap<object, ReactiveObject>()

    constructor(component: any) {
        this.component = component
    }

    public bindComponent() {
        for (const propertyKey in this.component) {
            if (this.component.hasOwnProperty(propertyKey)
                && !Reflect.hasMetadata(DECORATOR_UNREACTIVE_FLAG, this.component, propertyKey)
            ) {
                /* const reactiveProperty =  */this.bindObjectProperty(this.component, propertyKey)
                // this.applyComponentProperty(this.component, propertyKey, reactiveProperty)
            }
        }
    }

    private makeReactiveObject(
        obj: any,
        parentReactiveObject?: ReactiveObject,
        reactiveObject?: ReactiveObject
    ): ReactiveObject {
        if (!reactiveObject) {
            reactiveObject = new ReactiveObject()
        }

        if (parentReactiveObject) {
            reactiveObject.setParent(parentReactiveObject)
        }

        this.defineObjectProperty(obj, reactiveObject)

        return reactiveObject
    }

    private makeProxyObject(
        obj: any,
        reactiveProperty: ReactiveObject
    ): any {
        let ignoreNextLengthSetNotify = false

        return new Proxy(obj, {
            get: (target: any, targetPropertyKey: PropertyKey) => {
                if (targetPropertyKey === PROXY_TARGET_SYMBOL) {
                    return target
                }

                // this.watch(this.getObjectProperty(target, targetPropertyKey))

                return target[targetPropertyKey]
            },
            set: (target: any, targetPropertyKey: PropertyKey, value: any): boolean => {
                if (target.hasOwnProperty(targetPropertyKey)) {
                    if (Array.isArray(target) && targetPropertyKey === 'length') {
                        target[targetPropertyKey] = value

                        if (!ignoreNextLengthSetNotify) {
                            reactiveProperty.notifyParent()
                        }
                        ignoreNextLengthSetNotify = false
                    } else {
                        const reactiveValue = {
                            [targetPropertyKey]: value
                        }

                        // this.merge(target, reactiveValue, targetPropertyKey as string, reactiveProperty)

                        target[targetPropertyKey] = reactiveValue[targetPropertyKey as string]

                        const targetReactiveProperty = this.getObjectProperty(target, targetPropertyKey as string)
                        if (targetReactiveProperty) {
                            targetReactiveProperty.notifyParentAndChildren()
                        }
                    }
                } else {
                    ignoreNextLengthSetNotify = true
                    target[targetPropertyKey] = value
                    this.bindObjectProperty(obj, targetPropertyKey.toString(), reactiveProperty)
                    reactiveProperty.notifyParent()
                }

                return true
            }
        })
    }

    // private watch() {
    //     // const reactivityWatcher = ReactivityWatcher.getInstance()
    //     //
    //     // if (reactiveProperty && reactivityWatcher.isRecording()) {
    //     //     const updatingFunction = reactivityWatcher.getUpdatingFunction()
    //     //     const executingFunction = reactivityWatcher.getExecutingFunction()
    //     //     const variables = reactivityWatcher.getVariables()
    //     //
    //     //     if (updatingFunction && executingFunction && variables
    //     //         && !reactiveProperty.hasFunction(executingFunction)
    //     //     ) {
    //     //         const executingFunctionWithContext = reactivityWatcher.bindContext(executingFunction)
    //     //         const variableValues = Object.values(variables)
    //     //         const scope = reactivityWatcher.getScope()
    //     //
    //     //         if (scope) {
    //     //             scope.addDependent(reactiveProperty, executingFunction)
    //     //         }
    //     //
    //     //         reactiveProperty.addFunction(executingFunction, (depth?: number) => {
    //     //             updatingFunction(executingFunctionWithContext(
    //     //                 ...variableValues
    //     //             ), depth)
    //     //         })
    //     //     }
    //     // }
    // }

    private bindObjectProperties(obj: any, reactiveObject: ReactiveObject): void {
        for (const propertyKey in obj) {
            if (obj.hasOwnProperty(propertyKey)) {
                this.bindObjectProperty(obj, propertyKey, reactiveObject)
            }
        }
    }

    private bindObjectProperty(
        obj: any,
        propertyKey: string,
        parentReactiveObject?: ReactiveObject
    ): ReactiveObject {
        const propertyValue = obj[propertyKey]
        const reactiveObject = this.makeReactiveObject(obj, propertyKey, parentReactiveObject)

        if (typeof propertyValue === 'object') {
            this.bindObjectProperties(obj[propertyKey], reactiveObject)
            obj[propertyKey] = this.makeProxyObject(obj[propertyKey], reactiveObject)
        }

        return reactiveObject
    }

    private defineObjectProperty(obj: any, reactiveObject: ReactiveObject) {
        this.log.set(obj, reactiveObject)
    }

    private getObjectProperty(obj: any, propertyKey: PropertyKey) {
        return this.log.get(obj[propertyKey])
    }
}
