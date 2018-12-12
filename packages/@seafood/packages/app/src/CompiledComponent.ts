import {Component} from "@seafood/component";
import {ICompiledComponent} from "./ICompiledComponent";

export abstract class CompiledComponent extends Component implements ICompiledComponent {
    // @ts-ignore
    public render(element: any): void {
        //
    }
}
