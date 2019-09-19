import {Component, Input, Output, EventEmitter} from '@angular/core';
import {DefinitionAddExecuteServiceCommandTaskFormElement} from '../../definition-add-form.model';


@Component({
    selector: 'app-execute-service-command-task-form-element',
    templateUrl: './execute-service-command-task-form-element.component.html',
    styles: []
})
export class ExecuteServiceCommandTaskFormElementComponent {

    @Input() item: DefinitionAddExecuteServiceCommandTaskFormElement;

    @Input() availableEnvVariableNames: string[];

    @Output() deleteItem: EventEmitter<DefinitionAddExecuteServiceCommandTaskFormElement> =
        new EventEmitter<DefinitionAddExecuteServiceCommandTaskFormElement>();

    delete(): void {
        this.deleteItem.emit(this.item);
    }

    addArgument(): void {
        this.item.command.push('');
    }

    deleteArgument(i: number) {
        this.item.command.splice(i, 1);
    }

    addDependsOn(): void {
        this.item.dependsOn.push('');
    }

    deleteDependsOn(i: number) {
        this.item.dependsOn.splice(i, 1);
    }

    trackByIndex(index: number, obj: any): any {
        return index;
    }

}
