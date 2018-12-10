export class Compiler {
    protected readonly source: string;

    constructor(source: string) {
        this.source = source;
    }

    public compile(): string {
        return `
        export default class Component {
            const i = 2;
        }
        `;
    }
}
