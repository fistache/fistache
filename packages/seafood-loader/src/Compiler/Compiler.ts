export abstract class Compiler {
    protected readonly loader: any;
    protected readonly source: string;
    protected parsingTagName?: string;
    protected content: any;

    constructor(loader: any, source: any) {
        this.loader = loader;
        this.source = source;
        this.init();
        this.parseContent();
    }

    public abstract compile(): string;

    protected abstract init(): void;

    protected parseContent(): void {
        if (!this.parsingTagName) {
            this.content = "";
            return;
        }

        // todo: Возвращать значения между первым открывающим о последним
        // закрывающим тегом, а не первым открывающим и ПЕРВЫМ закрывающим
        // как сейчас.
        const regex = new RegExp(
            `<\\s*\\/?\\s*${this.parsingTagName}\\s*.*?>(.|\\n)*?<\\s*\\/\\s*${this.parsingTagName}\\s*.*?>`,
            "mi",
        );
        let result: any = this.source.match(regex);

        if (result && result.length) {
            // todo: Check is it always first element or not.
            result = result[0];

            const start = result.indexOf(">") + 1;
            const end = result.lastIndexOf("<");
            this.content = result.slice(start, end);
        } else {
            this.content = "";
        }
    }
}
