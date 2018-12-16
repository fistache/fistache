import "reflect-metadata";

export const DECORATOR_UNREACTIVE_FLAG = "unreactive";

export function unreactive() {
    return (target: any, methodName: string) => {
        Reflect.defineMetadata(DECORATOR_UNREACTIVE_FLAG, true, target, methodName);
    };
}
