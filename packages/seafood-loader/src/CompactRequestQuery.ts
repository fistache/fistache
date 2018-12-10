import _ from "lodash";

export class CompactRequestQuery {
    protected query: string[];

    constructor(params: any) {
        this.query = _.compact(params);
    }

    public toString(): string {
        return this.query.join("&");
    }
}
