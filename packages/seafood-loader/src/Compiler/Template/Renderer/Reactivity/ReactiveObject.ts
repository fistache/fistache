import { ReactiveProperty } from './ReactiveProperty'

export class ReactiveObject {
    private readonly map = new Map<any, ReactiveProperty>()

    public get(key: any) {
        return this.map.get(key)
    }

    public set(key: any, reactiveProperty?: ReactiveProperty) {
        if (!reactiveProperty) {
            reactiveProperty = new ReactiveProperty()
        }

        this.map.set(key, reactiveProperty)
    }
}
