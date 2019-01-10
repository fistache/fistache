import { ReactiveProperty } from './ReactiveProperty'

export class ReactiveObject {
    private readonly map = new Map<any, ReactiveProperty>()

    public get(key: any) {
        let reactiveProperty = this.map.get(key)

        if (!reactiveProperty) {
            reactiveProperty = new ReactiveProperty()
            this.set(key, reactiveProperty)
        }

        return reactiveProperty
    }

    public set(key: any, reactiveProperty: ReactiveProperty) {
        this.map.set(key, reactiveProperty)
    }
}
