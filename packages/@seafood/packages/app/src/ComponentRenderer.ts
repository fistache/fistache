import {Event} from "../../component";
import {CompiledComponent} from "./CompiledComponent";

export class ComponentRenderer {
    public render(component: CompiledComponent) {
        const handleCreatedEvents = component.hmrOptions.events[Event.Created];
        if (handleCreatedEvents && handleCreatedEvents.length) {
            handleCreatedEvents.forEach((event: () => void) => {
                component.bindEvent(Event.Created, event.bind(component));
            });
        }

        component.render(document.getElementById("app"));
        component.fireEvent(Event.Created);
    }
}
