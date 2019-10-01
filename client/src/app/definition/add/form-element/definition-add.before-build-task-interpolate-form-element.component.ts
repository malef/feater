import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DefinitionAddInterpolateTaskFormElement } from '../definition-add-form.model';

@Component({
    selector: 'app-definition-add-before-build-task-interpolate-form-element',
    templateUrl:
        './definition-add.before-build-task-interpolate-form-element.component.html',
    styles: [],
})
export class DefinitionAddBeforeBuildTaskInterpolateFormElementComponent
    implements OnInit {
    @Input() item: DefinitionAddInterpolateTaskFormElement;

    @Output() deleteItem: EventEmitter<
        DefinitionAddInterpolateTaskFormElement
    > = new EventEmitter<DefinitionAddInterpolateTaskFormElement>();

    ngOnInit() {}

    delete() {
        this.deleteItem.emit(this.item);
    }
}
