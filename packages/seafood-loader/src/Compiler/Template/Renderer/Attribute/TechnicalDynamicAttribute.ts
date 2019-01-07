import { NonStaticAttribute } from './NonStaticAttribute'

export class TechnicalDynamicAttribute extends NonStaticAttribute {
    public getName(): string {
        return this.name.slice(this.name.indexOf(':') + 1)
    }
}
