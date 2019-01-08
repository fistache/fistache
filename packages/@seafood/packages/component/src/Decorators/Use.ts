import { CompiledComponent } from '@seafood/app'

export function use(...args: any[]) {
    const usedComponents = new Map<string, CompiledComponent>()
    const usedStuff = new Set()

    for (const arg of args) {
        if (arg.isItCompiledComponent) {
            usedComponents.set(arg.getName(), arg)
        } else {
            usedStuff.add(arg)
        }
    }

    return (target: () => void) => {
        if (usedStuff.size) {
            target.prototype.usedStuff = usedStuff
        }

        if (usedComponents.size) {
            target.prototype.usedComponents = usedComponents
        }
    }
}

export function computeComponentName(compiledComponent: CompiledComponent): string {
    const component = compiledComponent.getComponent()
    let className = component.constructor.name

    if (className.includes('Component')) {
        className = className.slice(0, className.lastIndexOf('Component'))
    }

    const i = 0
}
