export const DECORATOR_FETCH_FLAG = 'fetch'

export function fetch() {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(
            DECORATOR_FETCH_FLAG, true, target, propertyKey
        )
        target[propertyKey] = null
    }
}
