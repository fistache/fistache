export class Styler {
    public static getInstance(): Styler {
        if (!Styler.instance) {
            Styler.instance = new Styler()
        }

        return Styler.instance
    }
    private static instance: Styler

    private styles = new Set<string>()

    public use(styles: string) {
        if (!this.styles.has(styles.toString())) {
            const head = document.head
                || document.getElementsByTagName('head')[0]
            const style = document.createElement('style')
            const text = document.createTextNode(styles.toString())

            style.type = 'text/css'

            style.appendChild(text)
            head.appendChild(style)
            this.styles.add(styles.toString())
        }
    }
}
