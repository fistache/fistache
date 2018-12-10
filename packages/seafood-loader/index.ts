import QueryString from "query-string";
import {CompactRequestQuery} from "./src/CompactRequestQuery";
import {SeafoodLoader} from "./src/SeafoodLoader";

export default function(this: any, source: string) {
    const {rootContext, resourcePath, resourceQuery} = this;
    const context = rootContext || process.cwd();
    const query = new CompactRequestQuery(QueryString.parse(resourceQuery.slice(1)));
    const loader = new SeafoodLoader(this, context, resourcePath, query, source);

    return loader.resolveRequest();
}

export const raw = true;
