interface IQueryObject {
    [key: string]: any;
}

export class CompactRequestQuery {
    protected query: IQueryObject;

    constructor(query: IQueryObject) {
        this.query = Object.assign({}, query); // add object prototype
    }

    public get(key: string) {
        return this.query[key];
    }

    public hasKey(key: string) {
        return this.query.hasOwnProperty(key);
    }

    public toString(): string {
        let result = "";

        for (const key in this.query) {
            if (this.query.hasOwnProperty(key)) {
                let value: any = this.query[key];

                if (typeof value === "undefined") {
                    value = "";
                } else {
                    value = `=${value}`;
                }

                result += `${key}${value}`;
            }
        }

        return result;
    }
}
