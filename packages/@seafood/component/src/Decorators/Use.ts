import { Component } from '../Component'

export interface ParsedArgs {
    usedComponents: Map<string, Component>
    usedStuff: Set<any>
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
    const usedComponents = new Map<string, Component>()
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
