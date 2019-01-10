import { DECORATOR_UNREACTIVE_FLAG } from '@seafood/component'
import { ReactiveObject } from './ReactiveObject'
import { ReactivityWatcher } from './ReactivityWatcher'

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
                this.bindObjectProperty(this.component, propertyKey)
            }
        }
    }

    private bindObjectProperty(obj: any, propertyKey: PropertyKey, reactiveObject?: ReactiveObject) {
        if (typeof obj[propertyKey] === 'object') {
            if (!reactiveObject) {
                reactiveObject = new ReactiveObject()
            }

            this.setObjectProperty(obj[propertyKey], reactiveObject)
            obj[propertyKey] = this.makeProxy(obj, propertyKey, reactiveObject)
        }
    }

    private makeProxy(obj: any, propertyKey: PropertyKey, reactiveObject: ReactiveObject) {
        return new Proxy(obj[propertyKey], {
            get: (target: any, targetPropertyKey: PropertyKey): any => {
                this.watch(reactiveObject, targetPropertyKey)
                console.log('get', targetPropertyKey)
                return target[targetPropertyKey]
            },
            set: (target: any, targetPropertyKey: PropertyKey, value: any): boolean => {
                target[targetPropertyKey] = value
                console.log('set', targetPropertyKey)
                return true
            }
        })
    }

    private watch(reactiveObject: ReactiveObject, propertyKey: PropertyKey) {
        const reactivityWatcher = ReactivityWatcher.getInstance()
        const reactiveProperty = reactiveObject.get(propertyKey)

        if (reactivityWatcher.isRecording()) {
            const updatingFunction = reactivityWatcher.getUpdatingFunction()
            const executingFunction = reactivityWatcher.getExecutingFunction()
            const variables = reactivityWatcher.getVariables()

            if (updatingFunction && executingFunction && variables
                && !reactiveProperty.hasFunction(executingFunction)
            ) {
                const executingFunctionWithContext = reactivityWatcher.bindContext(executingFunction)
                const variableValues = Object.values(variables)

                reactiveProperty.addFunction(executingFunction, (depth?: number) => {
                    updatingFunction(executingFunctionWithContext(
                        ...variableValues
                    ), depth)
                })
            }
        }
    }

    private setObjectProperty(obj: any, reactiveObject: ReactiveObject) {
        this.log.set(obj, reactiveObject)
    }

    // private getObjectProperty(obj: any) {
    //     return this.log.get(obj)
    // }
}
