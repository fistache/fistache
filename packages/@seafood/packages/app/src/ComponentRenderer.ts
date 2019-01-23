import { CompiledComponent } from './CompiledComponent'

export class ComponentRenderer {
    public render(component: CompiledComponent) {
        component.render(document.getElementById('app'))
    }
}
