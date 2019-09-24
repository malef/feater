import {Component, Input, Output, EventEmitter} from '@angular/core';
import {DefinitionAddFormDownloadableFormElement} from '../definition-add-form.model';


@Component({
    selector: 'app-definition-add-downloadable-form-element',
    templateUrl: './definition-add.downloadable-form-element.component.html',
    styles: []
})
export class DefinitionAddDownloadableFormElementComponent {

    @Input() item: DefinitionAddFormDownloadableFormElement;

    @Output() deleteItem: EventEmitter<DefinitionAddFormDownloadableFormElement> =
        new EventEmitter<DefinitionAddFormDownloadableFormElement>();

    delete() {
        this.deleteItem.emit(this.item);
    }

}
