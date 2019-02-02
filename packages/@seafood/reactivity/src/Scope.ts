import { ReactivityWatcher } from './ReactivityWatcher'

export class Scope {
    /**
     * Array of objects which properties the element will use
     * to bind a data.
     */
    protected variables: any

    protected context: any
    protected parentScope?: Scope

    constructor() {
        this.variables = {}
        this.context = null
    }

    public setContext(context: any): void {
        this.context = context
    }

    public getContext(): any {
        return this.context
    }

    public getVariables(): any {
        return this.variables
    }

    public setVariable(name: string, value: any): void {
        this.variables[name] = value
    }

    public setParentScope(scope: Scope): void {
        this.parentScope = scope
    }

    public getParentScope(): Scope | undefined {
        return this.parentScope
    }

    public executeExpression(
        expression: string,
        updatingFunction?: (value: any) => void
    ): any {
        const reactivityWatcher = ReactivityWatcher.getInstance()
        const variables = this.getExtendedVariables()
        const executingFunction = this.makeExpressionFunction(
            expression, Object.keys(variables)
        )

        reactivityWatcher.enableRecording()
        reactivityWatcher.setUpdatingFunction(updatingFunction)
        reactivityWatcher.setExecutingFunction(executingFunction)
        reactivityWatcher.setVariables(variables)
        reactivityWatcher.setScope(this)

        const expressionResult = reactivityWatcher.bindContext(
            executingFunction
        )(
            ...Object.values(variables)
        )

        reactivityWatcher.disableRecording()
        reactivityWatcher.removeUpdatingFunction()
        reactivityWatcher.removeExecutingFunction()
        reactivityWatcher.removeVariables()
        reactivityWatcher.removeScope()

        return expressionResult
    }

    public getExtendedVariables(): any[] {
        const extendedVariables: any = {}
        let scope: Scope | undefined = this

        while (scope) {
            const variables = scope.getVariables()

            for (const variableName in variables) {
                if (variables.hasOwnProperty(variableName)) {
                    const variableValue = variables[variableName]

                    if (extendedVariables.hasOwnProperty(variableName)) {
                        console.warn(
                            `Duplicate declaration of ${variableName}`
                            + `in template. `
                            + `The value of this variable will be overriten.`
                        )
                    }

                    extendedVariables[variableName] = variableValue
                }
            }

            scope = scope.getParentScope()
        }

        return extendedVariables
    }

    protected makeExpressionFunction(
        expression: string,
        args: any[]
    ): (...args: any[]) => void {
        let variables = ``

        for (const variableName of args) {
            variables += `${variableName} = ${variableName}() \n`
        }

        return new Function(
            ...args,
            `${variables} \n return ${expression};`
        ) as (...args: any[]) => void
    }
}
