import {REACTIVE_PROPERTY_FLAG, ReactiveProperty} from "@seafood/app";
import {DECORATOR_UNREACTIVE_FLAG} from "@seafood/component";
import "reflect-metadata";
import {ComplexVirtualNode} from "./ComplexVirtualNode";
import {VirtualNode} from "./VirtualNode";

export class TextVirtualNode extends VirtualNode {
    public constructor(element: any, parent?: ComplexVirtualNode) {
        super(parent);
        this.parsedElement = element;
    }

    public render(): void {
        const text = this.injectVartiables(this.parsedElement.data, this.component);
        this.renderedElement = document.createTextNode(text);
    }

    protected addReactivity() {
        const regexp = new RegExp("{{(.|\\n)*?}}", "gm");
        const matches = this.parsedElement.data.match(regexp);

        if (matches) {
            const vars = matches.map((variable: string) => {
                return variable.slice(2, -2).trim();
            });

            const depend = (obj: any, metadataProperty: any) => {
                const isObtainable = !Reflect.hasMetadata(DECORATOR_UNREACTIVE_FLAG, obj, metadataProperty);
                if (isObtainable) {
                    const reactiveProperty: ReactiveProperty = Reflect.getMetadata(
                        REACTIVE_PROPERTY_FLAG,
                        obj,
                        metadataProperty,
                    );
                    reactiveProperty.depend(() => {
                        this.rerender();
                    });
                }
            };

            vars.forEach((variable: string) => {
                const isObject = variable.includes(".");

                if (isObject) {
                    let resObj = this.component;
                    const nameParts = variable.split(".");
                    const lastNamePart = nameParts.pop();

                    nameParts.forEach((varName: string) => {
                        resObj = resObj[varName];
                    });
                    depend(resObj, lastNamePart);
                } else {
                    depend(this.component, variable);
                }
            });
        }
    }

    private injectVartiables(text: string, component: any): string {
        const regexp = new RegExp("{{(.|\\n)*?}}", "gm");
        return text.replace(regexp, (expression: string): string => {
            const varName = expression.slice(2, -2).trim();
            const isObject = varName.includes(".");

            if (isObject) {
                let result = component;
                varName.split(".").forEach((name: string) => {
                    result = result[name];
                });
                return result;
            } else {
                return component[varName];
            }
        });
    }
}
