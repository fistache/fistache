import { Component, COMPONENT_SYMBOL } from '../Component'

export interface ParsedArgs {
    usedComponents: Map<string, new () => Component>
    usedStuff: Map<string, any>
}

export function use(args: any) {
    const parsedArgs = parseArgs(args)
    const usedComponents = parsedArgs.usedComponents
    const usedStuff = parsedArgs.usedStuff

    return (target: () => void) => {
        if (usedStuff.size) {
            target.prototype.usedStuff = usedStuff
        }

        if (usedComponents.size) {
            target.prototype.usedComponents = usedComponents
        }
    }
}

export function parseArgs(args: any): ParsedArgs {
    const usedComponents = new Map<string, new () => Component>()
    const usedStuff = new Map<string, any>()

    for (const argName in args) {
        if (args.hasOwnProperty(argName)) {
            const argValue = args[argName]

            if (argValue
                && argValue.prototype
                && argValue.prototype[COMPONENT_SYMBOL]
            ) {
                usedComponents.set(computeComponentName(argName), argValue)
            } else {
                usedStuff.set(argName, argValue)
            }
        }
    }

    return {
        usedComponents,
        usedStuff
    }
}

export const computeComponentName = (name: string): string => {
    if (name.includes('Component')) {
        name = name.slice(0, name.lastIndexOf('Component'))
    }

    return name
}
