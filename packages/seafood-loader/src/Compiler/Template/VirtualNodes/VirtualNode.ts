export /*abstract*/
class VirtualNode implements IVirtualNode {
    public readonly type: string;

    constructor(type: string) {
        this.type = type;
    }
}
