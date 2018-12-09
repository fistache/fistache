import {Component, Event} from "../../component";

export class ComponentRenderer {
    public render(component: Component) {
        // @ts-ignore
        const handleCreatedEvents = component.hmrOptions.events[Event.Created];
        if (handleCreatedEvents && handleCreatedEvents.length) {
            handleCreatedEvents.forEach((event: () => void) => {
                component.bindEvent(Event.Created, event.bind(component));
            });
        }

        // @ts-ignore
        component.render(document.getElementById("app"));
        component.fireEvent(Event.Created);
    }
}
