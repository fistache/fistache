import {SingleVirtualNode} from "../SingleVirtualNode";

export class VirtualTextNode extends SingleVirtualNode {
    protected expressionResults: any[];
    protected expressions: any[];

    protected injectionFinderRegExp = new RegExp(/{{([\S\s]*?)}}/, "gm");

    public constructor() {
        super();
        this.expressions = [];
        this.expressionResults = [];
    }

    public render(): void {
        super.render();
        this.attachBuildedNode();
    }

    public beforeRender(): void {
        super.beforeRender();
        this.bindReactiveExpressions();
    }

    protected buildNode(): Node {
        let expressionIndex = 0;
        let text = this.parsedNode.data.trim();
        if (text.length) {
            text = this.parsedNode.data.replace(this.injectionFinderRegExp, () => {
                const value = this.expressionResults[expressionIndex];
                expressionIndex++;

                if (typeof value === "object") {
                    return JSON.stringify(value);
                } else {
                    return value;
                }
            });
        }

        return document.createTextNode(text);
    }

    protected bindReactiveExpressions(): void {
        this.expressions = this.getReactiveExpressionValues();
        const scope = this.getScope();

        for (const expressionIndex in this.expressions) {
            if (this.expressions.hasOwnProperty(expressionIndex)) {
                const expression = this.expressions[expressionIndex];
                this.expressionResults[expressionIndex] =
                    scope.executeExpression(expression, (value: any) => {
                        this.expressionResults[expressionIndex] = value;
                        this.removeBuildedNode();
                        this.render();
                    });
            }
        }
    }

    protected getReactiveExpressionValues(): any[] {
        let expressions: any[] = [];

        if (this.parsedNode.data) {
            const matches = this.parsedNode.data.match(this.injectionFinderRegExp);
            if (matches) {
                expressions = matches.map((expression: string) => {
                    return expression.slice(2, -2).trim();
                });
            }
        }

        return expressions;
    }
}
