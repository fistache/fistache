interface IAttributeProperties {
    required?: boolean;
}

export function attribute(properties?: IAttributeProperties) {
    return (target: any, title: string, descriptor: PropertyDescriptor) => {
        //
    };
}
