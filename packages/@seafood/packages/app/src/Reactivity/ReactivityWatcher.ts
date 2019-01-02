import {Scope} from "./Scope";

export class ReactivityWatcher {
    public static getInstance(): ReactivityWatcher {
        if (!this.instance) {
            this.instance = new ReactivityWatcher();
        }

        return this.instance;
    }

    private static instance?: ReactivityWatcher;
    private recording: boolean;
    private updatingFunction: ((value: any, depth?: number) => void);
    private executingFunction?: ((...args: any[]) => void) | null;
    private variables?: any[] | null;
    private scope?: Scope | null;

    private constructor() {
        this.updatingFunction = () => {};
        this.recording = false;
    }

    public setScope(scope: Scope): void {
        this.scope = scope;
    }

    public getScope(): Scope | null | undefined {
        return this.scope;
    }

    public bindContext(executingFunction: (...args: any[]) => void): (...args: any[]) => void {
        const scope = this.getScope();
        const context = scope && scope.getContext() || {};

        return executingFunction.bind(context);
    }

    public removeScope(): void {
        this.scope = null;
    }

    public setVariables(variables: any[]): void {
        this.variables = variables;
    }

    public getVariables(): any[] | null | undefined {
        return this.variables;
    }

    public removeVariables(): void {
        this.variables = null;
    }

    public setUpdatingFunction(updatingFunction?: (value: any, depth?: number) => void): void {
        if (updatingFunction) {
            this.updatingFunction = updatingFunction;
        } else {
            this.removeUpdatingFunction();
        }
    }

    public getUpdatingFunction(): ((value: any, depth?: number) => void) | null | undefined {
        return this.updatingFunction;
    }

    public removeUpdatingFunction(): void {
        this.updatingFunction = () => {};
    }

    public setExecutingFunction(executingFunction: (...args: any[]) => void): void {
        this.executingFunction = executingFunction;
    }

    public getExecutingFunction(): ((...args: any[]) => void) | null | undefined {
        return this.executingFunction;
    }

    public removeExecutingFunction(): void {
        this.executingFunction = null;
    }

    public enableRecording(): void {
        this.recording = true;
    }

    public disableRecording(): void {
        this.recording = false;
    }

    public isRecording(): boolean {
        return this.recording;
    }
}
