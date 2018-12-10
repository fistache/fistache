import _ from "lodash";

interface IQueryObject {
    [key: string]: any;
}

export class CompactRequestQuery {
    protected query: IQueryObject;

    constructor(query: IQueryObject) {
        this.query = query;
    }

    public hasKey(key: string) {
        return _.has(this.query, key);
    }

    public toString(): string {
        let result = "";

        for (const key in this.query) {
            if (this.query.hasOwnProperty(key)) {
                const value: any = this.query[key];
                result += `${key}${value ? `=${value}` : ""}`;
            }
        }

        return result;
    }
}
