import QueryString from "query-string";
import {CompactRequestQuery} from "./src/CompactRequestQuery";
import {SeafoodLoader} from "./src/SeafoodLoader";

export default function(this: any, source: any) {
    if (typeof source === "object") {
        source = source.toString("utf8");
    }

    const {rootContext, resourceQuery} = this;
    const context = rootContext || process.cwd();
    const query = new CompactRequestQuery(QueryString.parse(resourceQuery.slice(1)));
    const loader = new SeafoodLoader(this, context, query, source);

    return loader.resolveRequest();
}

export const raw = true;
