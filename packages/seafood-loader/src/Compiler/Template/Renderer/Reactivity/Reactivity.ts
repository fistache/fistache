import { DECORATOR_UNREACTIVE_FLAG } from '@seafood/component'
import { ReactiveProperty } from './ReactiveProperty'
import { ReactivityWatcher } from './ReactivityWatcher'

export const PROXY_TARGET_SYMBOL = Symbol('ProxyTarget')
export type ObjectPropertyContainer = Map<PropertyKey, ReactiveProperty>

// todo: fix memory leak
export class Reactivity {
    private readonly component: any
    private log = new WeakMap<object, ObjectPropertyContainer>()

    constructor(component: any) {
        this.component = component
    }

    public bindComponent(): any {
        for (const propertyKey in this.component) {
            if (typeof this.component[propertyKey] !== 'function'
                && !Reflect.hasMetadata(DECORATOR_UNREACTIVE_FLAG, this.component, propertyKey)) {
                const reactiveProperty = this.bindObjectProperty(this.component, propertyKey)
                // not proxy to work "this" in setTimeout and etc inside constructor
                this.bindComponentProperty(this.component, propertyKey, reactiveProperty)
            }
        }
    }

    protected setObjectProperty(obj: any, propertyKey: PropertyKey, reactiveProperty: ReactiveProperty) {
        let container = this.log.get(obj)

        if (!container) {
            container = new Map<PropertyKey, ReactiveProperty>()
            this.log.set(obj, container)
        }

        container.set(propertyKey, reactiveProperty)
    }

    protected getObjectProperty(obj: any, propertyKey: PropertyKey): ReactiveProperty {
        const container = this.log.get(obj) as ObjectPropertyContainer
        return container.get(propertyKey) as ReactiveProperty
    }

    private bindComponentProperty(obj: any, propertyKey: PropertyKey, reactiveProperty: ReactiveProperty) {
        const property = {
            value: obj[propertyKey]
        }

        Object.defineProperty(obj, propertyKey, {
            get: (): any => {
                this.watch(reactiveProperty)

                return property.value
            },
            set: (value: any): void => {
                const reactiveValue = {
                    [propertyKey]: value
                }

                this.merge(obj, reactiveValue, propertyKey as string, reactiveProperty)
                property.value = reactiveValue[propertyKey as string]
                reactiveProperty.notifyParentAndChildren()
            }
        })
    }

    private bindObjectProperties(obj: any, parentReactiveProperty: ReactiveProperty): void {
        for (const propertyKey in obj) {
            if (obj.hasOwnProperty(propertyKey)) {
                this.bindObjectProperty(obj, propertyKey, parentReactiveProperty)
            }
        }
    }

    private bindObject(
        obj: any,
        propertyKey: PropertyKey,
        parentReactiveProperty?: ReactiveProperty,
        reactiveProperty?: ReactiveProperty
    ): ReactiveProperty {
        if (!reactiveProperty) {
            reactiveProperty = new ReactiveProperty()
        }

        if (parentReactiveProperty) {
            reactiveProperty.setParent(parentReactiveProperty)
            parentReactiveProperty.addChild(reactiveProperty)
        }

        this.setObjectProperty(obj, propertyKey, reactiveProperty)

        return reactiveProperty
    }

    private bindObjectProperty(
        obj: any,
        propertyKey: PropertyKey,
        parentReactiveProperty?: ReactiveProperty,
        isComlete?: boolean
    ): ReactiveProperty {
        const propertyValue = obj[propertyKey]
        const reactiveProperty = this.bindObject(obj, propertyKey, parentReactiveProperty)

        if (propertyValue !== null && typeof propertyValue === 'object') {
            this.bindObjectProperties(obj[propertyKey], reactiveProperty)

            if (!isComlete) {
                obj[propertyKey] = this.makeProxy(obj, propertyKey, reactiveProperty)
            }
        }

        return reactiveProperty
    }

    private makeProxy(obj: any, propertyKey: PropertyKey, reactiveProperty: ReactiveProperty) {
        let ignoreNextLengthSetNotify = false

        return new Proxy(obj[propertyKey], {
            get: (target: any, targetPropertyKey: PropertyKey): any => {
                if (targetPropertyKey === PROXY_TARGET_SYMBOL) {
                    return target
                }

                const targetReactiveProperty = this.getObjectProperty(target, targetPropertyKey)

                if (targetReactiveProperty) {
                    this.watch(targetReactiveProperty)
                }

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

                        this.merge(target, reactiveValue, targetPropertyKey as string, reactiveProperty)

                        target[targetPropertyKey] = reactiveValue[targetPropertyKey as string]

                        const targetReactiveProperty = this.getObjectProperty(target, targetPropertyKey)
                        if (targetReactiveProperty) {
                            targetReactiveProperty.notifyParentAndChildren()
                        }
                    }
                } else {
                    ignoreNextLengthSetNotify = true
                    target[targetPropertyKey] = value
                    this.bindObjectProperty(obj, targetPropertyKey, reactiveProperty)
                    reactiveProperty.notifyParent()
                }

                return true
            }
        })
    }

    private merge(
        from: any,
        to: any,
        propertyKey: string,
        reactiveProperty?: ReactiveProperty,
        parentReactiveProperty?: ReactiveProperty
    ): void {
        const fromValue = from && from[propertyKey]
        const toValue = to[propertyKey]

        reactiveProperty = this.bindObject(to, propertyKey, parentReactiveProperty, reactiveProperty)

        if (typeof toValue === 'object') {
            for (const toValuePropertyKey in toValue) {
                if (toValue.hasOwnProperty(toValuePropertyKey)) {
                    let toValueReactiveProperty

                    if (fromValue && fromValue.hasOwnProperty(toValuePropertyKey)) {
                        toValueReactiveProperty = this.getObjectProperty(fromValue, toValuePropertyKey)
                    } else {
                        toValueReactiveProperty = this.bindObject(toValue, toValuePropertyKey, reactiveProperty)
                    }

                    this.merge(fromValue, toValue, toValuePropertyKey, toValueReactiveProperty, reactiveProperty)
                }
            }
            to[propertyKey] = this.makeProxy(to, propertyKey, reactiveProperty)
        }
    }

    private watch(reactiveProperty: ReactiveProperty) {
        const reactivityWatcher = ReactivityWatcher.getInstance()

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
}
