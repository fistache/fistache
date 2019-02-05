export function render(component: any) {
    const documentFragment = document.createDocumentFragment()
    component.render(documentFragment)
}
