export class Scope {
    /**
     * Array of objects which properties the element will use
     * to bind a data.
     */
    protected areas: object[];

    constructor() {
        this.areas = [];
    }

    public extend(scope: Scope): void {
        this.areas = scope.getAreas();
    }

    public addArea(area: object): void {
        this.areas.push(area);
    }

    public getAreas(): object[] {
        return this.areas;
    }
}
