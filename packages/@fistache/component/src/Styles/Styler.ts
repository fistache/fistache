export class Styler {
    private styles = new Map<string, Element>()

    public use(fileId: string, styles: string, replace = false) {
        if (!this.styles.has(fileId) || replace) {
            if (replace) {
                this.removeIfExists(fileId)
            }

            const head = document.head
                || document.getElementsByTagName('head')[0]
            const style = document.createElement('style')
            const text = document.createTextNode(styles.toString())

            style.type = 'text/css'

            style.appendChild(text)
            head.appendChild(style)
            this.styles.set(fileId, style)
        }
    }

    public clear() {
        this.styles.clear()
    }

    private removeIfExists(fileId: string) {
        const element = this.styles.get(fileId)

        if (element && element.parentNode) {
            element.parentNode.removeChild(element)
        }
    }
}
