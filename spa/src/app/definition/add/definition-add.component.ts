import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {map, switchMap} from 'rxjs/operators';
import {Apollo} from 'apollo-angular';
import {jsonToGraphQLQuery} from 'json-to-graphql-query';
import {NgxSpinnerService} from 'ngx-spinner';
import {
    DefinitionAddForm,
    DefinitionAddFormSourceFormElement,
    DefinitionAddFormVolumeFormElement,
    DefinitionAddFormProxiedPortFormElement,
    DefinitionAddFormEnvVariableFormElement,
    DefinitionAddFormSummaryItemFormElement,
    DefinitionAddFormConfigFormElement,
    DefinitionAddActionFormElement,
} from './definition-add-form.model';
import {
    getProjectQueryGql,
    GetProjectQueryInterface,
    GetProjectQueryProjectFieldInterface,
} from './get-project.query';
import _ from 'lodash';
import jsYaml from 'js-yaml';
import camelCaseKeys from 'camelcase-keys';
import gql from 'graphql-tag';


@Component({
    selector: 'app-definition-add',
    templateUrl: './definition-add.component.html',
    styles: []
})
export class DefinitionAddComponent implements OnInit {

    item: DefinitionAddForm;

    project: GetProjectQueryProjectFieldInterface;

    action = 'add';

    mode = 'form';

    @ViewChild('yamlConfig') yamlConfigElement: ElementRef;

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected apollo: Apollo,
        protected spinner: NgxSpinnerService,
    ) {
        this.item = {
            name: '',
            config: {
                sources: [],
                volumes: [],
                proxiedPorts: [],
                envVariables: [],
                composeFile: {
                    sourceId: '',
                    envDirRelativePath: '',
                    composeFileRelativePaths: [''],
                },
                actions: [
                    {
                        id: 'create_instance',
                        type: 'instantiation',
                        name: 'Create instance',
                        afterBuildTasks: [],
                    }
                ],
                summaryItems: [],
            },
        };
    }

    ngOnInit() {
        this.getProject();
    }

    submit(): void {
        this.apollo.mutate({
            mutation: gql`${this.getCreateDefinitionMutation()}`,
        }).subscribe(
            ({data}) => {
                this.router.navigate(['/definition', data.createDefinition.id]);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    addSource(): void {
        this.item.config.sources.push({
            id: '',
            cloneUrl: '',
            reference: {
                type: 'branch',
                name: ''
            },
            beforeBuildTasks: []
        });
    }

    deleteSource(source: DefinitionAddFormSourceFormElement): void {
        const index = this.item.config.sources.indexOf(source);
        if (-1 !== index) {
            this.item.config.sources.splice(index, 1);
        }
    }

    addVolume(): void {
        this.item.config.volumes.push({
            id: '',
            assetId: '',
        });
    }

    deleteVolume(volume: DefinitionAddFormVolumeFormElement): void {
        const index = this.item.config.volumes.indexOf(volume);
        if (-1 !== index) {
            this.item.config.volumes.splice(index, 1);
        }
    }

    addProxiedPort(): void {
        this.item.config.proxiedPorts.push({
            serviceId: '',
            id: '',
            name: '',
            port: null,
        });
    }

    deleteProxiedPort(proxiedPort: DefinitionAddFormProxiedPortFormElement): void {
        const index = this.item.config.proxiedPorts.indexOf(proxiedPort);
        if (-1 !== index) {
            this.item.config.proxiedPorts.splice(index, 1);
        }
    }

    addEnvVariable(): void {
        this.item.config.envVariables.push({
            name: '',
            value: ''
        });
    }

    deleteEnvVariable(envVariable: DefinitionAddFormEnvVariableFormElement): void {
        const index = this.item.config.envVariables.indexOf(envVariable);
        if (-1 !== index) {
            this.item.config.envVariables.splice(index, 1);
        }
    }

    addAction(): void {
        this.item.config.actions.push({
            id: '',
            type: 'modification',
            name: '',
            afterBuildTasks: [],
        });
    }

    deleteAction(action: DefinitionAddActionFormElement): void {
        const index = this.item.config.actions.indexOf(action);
        if (-1 !== index) {
            this.item.config.actions.splice(index, 1);
        }
    }


    addSummaryItem(): void {
        this.item.config.summaryItems.push({
            name: '',
            value: ''
        });
    }

    deleteSummaryItem(summaryItem: DefinitionAddFormSummaryItemFormElement): void {
        const index = this.item.config.summaryItems.indexOf(summaryItem);
        if (-1 !== index) {
            this.item.config.summaryItems.splice(index, 1);
        }
    }

    switchMode(mode: string): void {
        this.mode = mode;
    }

    toggleMode(): void {
        this.switchMode('yaml' === this.mode ? 'form' : 'yaml');
    }

    importYamlConfig(yamlConfig): void {
        this.item.config = this.mapYamlConfig(yamlConfig);
        this.yamlConfigElement.nativeElement.value = '';
        this.switchMode('form');
    }

    getAvailableEnvVariableNames(): string[] {
        const availableEnvVariableNames = [];
        for (const envVariable of this.item.config.envVariables) {
            availableEnvVariableNames.push(envVariable.name);
        }
        availableEnvVariableNames.push('FEATER__INSTANCE_ID');
        for (const proxiedPort of this.item.config.proxiedPorts) {
            availableEnvVariableNames.push(`FEATER__PROXY_DOMIAN__${proxiedPort.id.toUpperCase()}`);
        }

        return availableEnvVariableNames;
    }

    protected mapItem(): any {
        const mappedItem = {
            projectId: this.project.id,
            name: this.item.name,
            config: {
                sources: this.item.config.sources,
                volumes: this.item.config.volumes,
                proxiedPorts: this.item.config.proxiedPorts.map(proxiedPort => ({
                    id: proxiedPort.id,
                    serviceId: proxiedPort.serviceId,
                    port: parseInt(proxiedPort.port, 10),
                    name: proxiedPort.name,
                })),
                envVariables: this.item.config.envVariables,
                composeFiles: [
                    this.item.config.composeFile,
                ],
                actions: this.item.config.actions.map(action => ({
                    id: action.id,
                    name: action.name,
                    type: action.type,
                    afterBuildTasks: action.afterBuildTasks.map(afterBuildTask => {
                        const mappedAfterBuildTask = _.cloneDeep(afterBuildTask);

                        if ('' === mappedAfterBuildTask.id) {
                            delete mappedAfterBuildTask.id;
                        }

                        if (0 === mappedAfterBuildTask.dependsOn.length) {
                            delete mappedAfterBuildTask.dependsOn;
                        }

                        if ('executeHostCommand' === afterBuildTask.type || 'executeServiceCommand' === afterBuildTask.type) {
                            // @ts-ignore
                            afterBuildTask.command = _.filter(afterBuildTask.command, (commandPart) => !/^ *$/.test(commandPart));
                            // @ts-ignore
                            for (const inheritedEnvVariable of afterBuildTask.inheritedEnvVariables) {
                                if (/^ *$/.test(inheritedEnvVariable.alias)) {
                                    inheritedEnvVariable.alias = null;
                                }
                            }
                        }

                        return mappedAfterBuildTask;
                    }),
                })),
                summaryItems: this.item.config.summaryItems,
            },
        };


        return mappedItem;
    }

    protected mapYamlConfig(yamlConfig: any): DefinitionAddFormConfigFormElement {
        // TODO Check schema validity of Yaml config.

        const camelCaseYamlConfig = camelCaseKeys(jsYaml.safeLoad(yamlConfig), {deep: true});

        const mappedYamlConfig = {
            sources: [],
            volumes: [],
            proxiedPorts: [],
            envVariables: [],
            composeFile: null,
            summaryItems: [],
            actions: [],
        };

        for (const source of camelCaseYamlConfig.sources) {
            mappedYamlConfig.sources.push(source);
        }

        for (const volume of camelCaseYamlConfig.volumes) {
            mappedYamlConfig.volumes.push(volume);
        }

        for (const proxiedPort of camelCaseYamlConfig.proxiedPorts) {
            mappedYamlConfig.proxiedPorts.push({
                id: proxiedPort.id,
                serviceId: proxiedPort.serviceId,
                port: `${proxiedPort.port}`,
                name: proxiedPort.name,
            });
        }

        for (const envVariable of camelCaseYamlConfig.envVariables) {
            mappedYamlConfig.envVariables.push(envVariable);
        }

        mappedYamlConfig.composeFile = {
            sourceId: camelCaseYamlConfig.composeFiles[0].sourceId,
            envDirRelativePath: camelCaseYamlConfig.composeFiles[0].envDirRelativePath,
            composeFileRelativePaths: camelCaseYamlConfig.composeFiles[0].composeFileRelativePaths,
        };

        for (const action of camelCaseYamlConfig.actions) {
            const mappedAfterBuildTasks = [];
            for (const afterBuildTask of action.afterBuildTasks) {
                const mappedAfterBuildTask = afterBuildTask;

                if (!afterBuildTask.id) {
                    mappedAfterBuildTask.id = '';
                }

                if (!afterBuildTask.dependsOn) {
                    mappedAfterBuildTask.dependsOn = [];
                }

                mappedAfterBuildTasks.push(mappedAfterBuildTask);
            }
            mappedYamlConfig.actions.push({
                id: action.id,
                type: action.type,
                name: action.name,
                afterBuildTasks: mappedAfterBuildTasks,
            });
        }

        for (const summaryItem of camelCaseYamlConfig.summaryItems) {
            mappedYamlConfig.summaryItems.push(summaryItem);
        }

        return mappedYamlConfig;
    }

    protected getCreateDefinitionMutation(): string {
        const mutation = {
            mutation: {
                createDefinition: {
                    __args: this.mapItem(),
                    id: true,
                }
            }
        };

        return jsonToGraphQLQuery(mutation);
    }

    protected getProject(): void {
        this.spinner.show();
        this.route.params.pipe(
            switchMap(
                (params: Params) => {
                    return this.apollo
                        .watchQuery<GetProjectQueryInterface>({
                            query: getProjectQueryGql,
                            variables: {
                                id: params['id'],
                            },
                        })
                        .valueChanges
                        .pipe(
                            map(result => {
                                return result.data.project;
                            })
                        );
                }
            ))
            .subscribe(
                (item: GetProjectQueryProjectFieldInterface) => {
                    this.project = item;
                    this.spinner.hide();
                }
            );
    }

}
