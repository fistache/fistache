import { DynamicAttribute } from './DynamicAttribute'

export class SpecialAttribute extends DynamicAttribute {
    public append() {
        this.resolveAttributeByName()
    }

    private resolveAttributeByName() {
        switch (this.name) {
            case('if'):
                this.appendIfAttribute()
                break
            // ignore for cause it's package-specific attribute
            case('for'): break
        }
    }

    private appendIfAttribute() {
        console.log('@if', this.value)
    }
}
