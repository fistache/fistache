import 'reflect-metadata'
import { Component } from './Component'
import {DECORATOR_FETCH_FLAG} from './Decorators/fetch'

export abstract class Page extends Component {
    public static async fetch(_vars: any): Promise<any> {
        // empty by default
    }

    protected constructor() {
        super()
        this.fetchFlaggedField()
    }

    private fetchFlaggedField() {
        for (const field in this) {
            if (Reflect.hasMetadata(DECORATOR_FETCH_FLAG, this, field)) {
                // @ts-ignore
                this[field] = JSON.parse(window.FISTACHE_FETCH)
                break
            }
        }
    }
}
