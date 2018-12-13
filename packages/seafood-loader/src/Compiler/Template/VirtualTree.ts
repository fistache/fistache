import {VirtualNode} from "./VirtualNodes/VirtualNode";

export class VirtualTree {
    public static readonly RENDER_FUNCTION_ROOT_ELEMENT = "rootElement";
    public static readonly RENDER_FUNCTION_APPEND_FUNCTION = "append";

    public renderedElement: any;
    public childNodes: VirtualNode[];

    public constructor() {
        this.childNodes = [];
    }

    public addChildNode(node: VirtualNode) {
        this.childNodes.push(node);
    }

    public compileTree(): string {
        let code = `
        const ${VirtualTree.RENDER_FUNCTION_APPEND_FUNCTION} =
        function (parentRenderedElement, renderedElement): void {
            if (parentRenderedElement) {
                try {
                  parentRenderedElement.appendChild(renderedElement);
                } catch(e) {
                  console.log(e, parentRenderedElement, renderedElement);
                }
            }
        }
        `;
        let stack = this.childNodes.slice();
        this.bindParentRenderedElementIdToChildNodes(stack);

        while (stack.length) {
            const virtualElement: any = stack.pop();
            const childNodes = virtualElement.childNodes ? virtualElement.childNodes.slice().reverse() : [];
            const parsedElementId = this.genarateId();
            const parsedElement = this.stringifyParsedElement(virtualElement.parsedElement);
            const renderedObject = virtualElement.renderAndAppend(
                virtualElement.parentRenderedElementId,
                parsedElementId,
            );

            code += `
                const ${parsedElementId} = ${parsedElement}
                ${renderedObject.renderFunction}
            `;

            this.bindParentRenderedElementIdToChildNodes(childNodes, renderedObject.renderedElementId);
            stack = stack.concat(childNodes);
        }

        code = `
            function(${VirtualTree.RENDER_FUNCTION_ROOT_ELEMENT}) {
                ${code}
            }
        `;

        console.log(code);
        return code;
    }

    public render() {
        //
    }

    public append() {
        //
    }

    public renderAndAppend() {
        this.render();
        this.append();
    }

    private bindParentRenderedElementIdToChildNodes(childNodes: VirtualNode[], parentRenderedElementId?: string): void {
        if (!parentRenderedElementId) {
            parentRenderedElementId = VirtualTree.RENDER_FUNCTION_ROOT_ELEMENT;
        }

        childNodes.forEach((node: VirtualNode) => {
            node.parentRenderedElementId = parentRenderedElementId;
        });
    }

    private genarateId(len: number = 20) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (let i = 0; i < len; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    private stringifyParsedElement(parsedElement: any) {
        const result: any = {
            type: parsedElement.type,
        };

        if (parsedElement.name) {
            result.name = parsedElement.name;
        }

        if (parsedElement.data) {
            result.data = parsedElement.data;
        }

        if (parsedElement.attribs) {
            result.attribs = parsedElement.attribs;
        }

        return JSON.stringify(result);
    }
}
