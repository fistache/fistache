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
        // @ts-ignore
        if (window.FISTACHE_FETCH) {
            // @ts-ignore
            let result = window.FISTACHE_FETCH

            if (typeof result === 'string' && result.length) {
                result = JSON.parse(result)
            }

            for (const field in this) {
                if (Reflect.hasMetadata(DECORATOR_FETCH_FLAG, this, field)) {
                    this[field] = result
                    break
                }
            }
        }
    }
}
