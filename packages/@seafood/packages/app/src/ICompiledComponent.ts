import {IHmrOptions} from "./IHmrOptions";

export interface ICompiledComponent {
    rootElement: any;
    renderer: any;
    hmrOptions: IHmrOptions;

    render(element?: any): void;

    rerender(): void;

    setRenderer(renderer: any): void;
}
