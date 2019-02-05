import {DECORATOR_UNREACTIVE_FLAG} from '@seafood/shared'
import 'reflect-metadata'

export function unreactive() {
    return (target: any, propertyKey: string | symbol) => {
        Reflect.defineMetadata(
            DECORATOR_UNREACTIVE_FLAG, true, target, propertyKey
        )
    }
}
