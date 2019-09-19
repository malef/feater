import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
import {
    DefinitionAddFormVolumeFormElement,
    DefinitionAddBeforeBuildTaskFormElement,
    DefinitionAddCopyTaskFormElement,
    DefinitionAddInterpolateTaskFormElement,
} from '../definition-add-form.model';


@Component({
    selector: 'app-definition-add-volume-form-element',
    templateUrl: './definition-add.volume-form-element.component.html',
    styles: []
})
export class DefinitionAddVolumeFormElementComponent implements OnInit {

    @Input() volume: DefinitionAddFormVolumeFormElement;

    @Output() deleteItem: EventEmitter<DefinitionAddFormVolumeFormElement> =
        new EventEmitter<DefinitionAddFormVolumeFormElement>();

    ngOnInit() {}

    delete() {
        this.deleteItem.emit(this.volume);
    }

}
