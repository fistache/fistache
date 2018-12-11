import _ from "lodash";

interface IQueryObject {
    [key: string]: any;
}

export class CompactRequestQuery {
    protected query: IQueryObject;

    constructor(query: IQueryObject) {
        this.query = query;
    }

    public get(key: string) {
        return _.get(this.query, key);
    }

    public hasKey(key: string) {
        return _.has(this.query, key);
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
