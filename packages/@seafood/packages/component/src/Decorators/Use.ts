import { CompiledComponent } from '@seafood/app'
import hyphenate from 'hyphenate'

export function use(args: any) {
    const usedComponents = new Map<string, CompiledComponent>()
    const usedStuff = new Set()

    for (const argName in args) {
        if (args.hasOwnProperty(argName)) {
            const argValue = args[argName]

            if (argValue.isItCompiledComponent) {
                usedComponents.set(computeComponentName(argName), argValue)
            } else {
                usedStuff.add(argValue)
            }
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

export const computeComponentName = (name: string): string => {
    if (name.includes('Component')) {
        name = name.slice(0, name.lastIndexOf('Component'))
    }

    return hyphenate(name, {lowerCase: true})
}
