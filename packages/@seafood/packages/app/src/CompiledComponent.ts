import {Component} from "@seafood/component";
import {ICompiledComponent} from "./ICompiledComponent";
import {IHmrOptions} from "./IHmrOptions";

export abstract class CompiledComponent extends Component implements ICompiledComponent {
    public rootElement: any;
    public hmrOptions: IHmrOptions;
    public renderer: any;

    protected constructor() {
        super();
        this.hmrOptions = {
            events: [],
        };
    }

    // @ts-ignore
    public render(element?: any): void {
        //
    }

    // @ts-ignore
    public rerender(): void {
        //
    }

    public setRenderer(renderer: any): void {
        this.renderer = renderer;
    }
}
