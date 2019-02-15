export const DECORATOR_FETCH_FLAG = 'fetch'

export function await() {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(
            DECORATOR_FETCH_FLAG, true, target, propertyKey
        )
    }
}
