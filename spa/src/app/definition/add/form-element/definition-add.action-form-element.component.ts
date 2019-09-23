import {Component, Input, Output, EventEmitter} from '@angular/core';
import {
    DefinitionAddActionFormElement, DefinitionAddAfterBuildTaskFormElement, DefinitionAddCopyAssetIntoContainerTaskFormElement,
    DefinitionAddExecuteHostCommandTaskFormElement,
    DefinitionAddExecuteServiceCommandTaskFormElement
} from '../definition-add-form.model';


@Component({
    selector: 'app-definition-add-action-form-element',
    templateUrl: './definition-add.action-form-element.component.html',
    styles: []
})
export class DefinitionAddActionFormElementComponent {

    @Input() item: DefinitionAddActionFormElement;

    @Input() availableEnvVariableNames: string[];

    @Output() deleteItem: EventEmitter<DefinitionAddActionFormElement> =
        new EventEmitter<DefinitionAddActionFormElement>();

    delete() {
        this.deleteItem.emit(this.item);
    }

    addAfterBuildTaskExecuteHostCommand(): void {
        this.item.afterBuildTasks.push({
            type: 'executeHostCommand',
            id: '',
            dependsOn: [],
            command: [''],
            inheritedEnvVariables: [],
            customEnvVariables: [],
        } as DefinitionAddExecuteHostCommandTaskFormElement);
    }

    addAfterBuildTaskExecuteServiceCommand(): void {
        this.item.afterBuildTasks.push({
            type: 'executeServiceCommand',
            id: '',
            dependsOn: [],
            command: [''],
            inheritedEnvVariables: [],
            customEnvVariables: [],
        } as DefinitionAddExecuteServiceCommandTaskFormElement);

        console.log(this.item);
    }

    addAfterBuildTaskCopyAssetIntoContainer(): void {
        this.item.afterBuildTasks.push({
            type: 'copyAssetIntoContainer',
            id: '',
            dependsOn: [],
            serviceId: '',
            assetId: '',
            destinationPath: '',
        } as DefinitionAddCopyAssetIntoContainerTaskFormElement);
    }

    isAfterBuildTaskExecuteHostCommand(afterBuildTask: DefinitionAddAfterBuildTaskFormElement): boolean {
        return 'executeHostCommand' === afterBuildTask.type;
    }

    isAfterBuildTaskExecuteServiceCommand(afterBuildTask: DefinitionAddAfterBuildTaskFormElement): boolean {
        return 'executeServiceCommand' === afterBuildTask.type;
    }

    isAfterBuildTaskCopyAssetIntoContainer(afterBuildTask: DefinitionAddAfterBuildTaskFormElement): boolean {
        return 'copyAssetIntoContainer' === afterBuildTask.type;
    }

    deleteAfterBuildTask(afterBuildTask: DefinitionAddAfterBuildTaskFormElement): void {
        const index = this.item.afterBuildTasks.indexOf(afterBuildTask);
        if (-1 !== index) {
            this.item.afterBuildTasks.splice(index, 1);
        }
    }

    getAvailableEnvVariableNames(): string[] {
        // TODO Update.
        const availableEnvVariableNames = [];
        // for (const envVariable of this.item.envVariables) {
        //     availableEnvVariableNames.push(envVariable.name);
        // }
        availableEnvVariableNames.push('FEATER__INSTANCE_ID');
        // for (const proxiedPort of this.item.proxiedPorts) {
        //     availableEnvVariableNames.push(`FEATER__PROXY_DOMIAN__${proxiedPort.id.toUpperCase()}`);
        // }

        return availableEnvVariableNames;
    }

}
