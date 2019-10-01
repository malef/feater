import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DefinitionAddCopyTaskFormElement } from '../definition-add-form.model';

@Component({
    selector: 'app-definition-add-before-build-task-copy-form-element',
    templateUrl:
        './definition-add.before-build-task-copy-form-element.component.html',
    styles: [],
})
export class DefinitionAddBeforeBuildTaskCopyFormElementComponent
    implements OnInit {
    @Input() item: DefinitionAddCopyTaskFormElement;

    @Output() deleteItem: EventEmitter<
        DefinitionAddCopyTaskFormElement
    > = new EventEmitter<DefinitionAddCopyTaskFormElement>();

    ngOnInit() {}

    delete() {
        this.deleteItem.emit(this.item);
    }
}
