import 'reflect-metadata'

export const DECORATOR_UNREACTIVE_FLAG = 'unreactive'

export function unreactive() {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(DECORATOR_UNREACTIVE_FLAG, true, target, propertyKey)
    }
}
