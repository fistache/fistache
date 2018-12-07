import {Component} from "@seafood/component";

export class CompiledComponent extends Component {
    public parentNode = null;

    public hmrOptions: object = {};
    public uncompiledTemplate = [];

    private renderer = null;

    public initHmrOptions() {
        this.hmrOptions = {
            events: {},
        };
    }

    public setContent(content: any) {
        this.uncompiledTemplate = content;
    }

    public setRenderer(renderer: any) {
        this.renderer = renderer;
    }

    public render(parentNode: any) {
        if (parentNode) {
            this.parentNode = parentNode;
        } else {
            parentNode = this.parentNode;
        }

        if (!parentNode) {
            console.warn("Parent node for this component is not specified, cancelling rendering...");
            return;
        }

        // @ts-ignore
        this.renderer
            .setContext(parentNode)
            .setContent(this.uncompiledTemplate)
            .render();
    }
}
