export interface DefinitionAddForm {
    name: string;
    config: DefinitionAddFormConfigFormElement;
}

export interface DefinitionEditForm extends DefinitionAddForm {
    id: string;
}

export interface DefinitionAddFormConfigFormElement {
    sources: DefinitionAddFormSourceFormElement[];
    volumes: DefinitionAddFormVolumeFormElement[];
    proxiedPorts: DefinitionAddFormProxiedPortFormElement[];
    envVariables: DefinitionAddFormEnvVariableFormElement[];
    composeFile: DefinitionAddComposeFileFormElement;
    actions: DefinitionAddActionFormElement[];
    summaryItems: DefinitionAddFormSummaryItemFormElement[];
    downloadables: DefinitionAddFormDownloadableFormElement[];
}

export interface DefinitionAddFormSourceFormElement {
    id: string;
    cloneUrl: string;
    reference: DefinitionAddFormComponentReferenceFormElement;
    beforeBuildTasks: Array<
        | DefinitionAddBeforeBuildTaskFormElement
        | DefinitionAddCopyTaskFormElement
        | DefinitionAddInterpolateTaskFormElement
    >;
}

export interface DefinitionAddFormVolumeFormElement {
    id: string;
    assetId: string;
}

export interface DefinitionAddFormComponentReferenceFormElement {
    type: string;
    name: string;
}

export interface DefinitionAddFormProxiedPortFormElement {
    serviceId: string;
    id: string;
    name: string;
    port: string;
}

export interface DefinitionAddFormEnvVariableFormElement {
    name: string;
    value: string;
}

export interface DefinitionAddFormSummaryItemFormElement {
    name: string;
    value: string;
}

export interface DefinitionAddFormDownloadableFormElement {
    id: string;
    name: string;
    serviceId: string;
    absolutePath: string;
}

export interface DefinitionAddComposeFileFormElement {
    sourceId: string;
    envDirRelativePath: string;
    composeFileRelativePaths: string[];
}

export interface DefinitionAddActionFormElement {
    type: string;
    id: string;
    name: string;
    afterBuildTasks: DefinitionAddAfterBuildTaskFormElement[];
}

export interface DefinitionAddAfterBuildTaskFormElement {
    type: string;
    id?: string;
    dependsOn?: string[];
}

export interface DefinitionAddFormDownloadableFormElement {
    id: string;
    name: string;
    serviceId: string;
    absolutePath: string;
}

export interface DefinitionAddExecuteCommandTaskFormElement
    extends DefinitionAddAfterBuildTaskFormElement {
    inheritedEnvVariables: {
        name: string;
        alias: string;
    }[];
    customEnvVariables: {
        name: string;
        value: string;
    }[];
    command: string[];
}

export interface DefinitionAddExecuteHostCommandTaskFormElement
    extends DefinitionAddExecuteCommandTaskFormElement {}

export interface DefinitionAddExecuteServiceCommandTaskFormElement
    extends DefinitionAddExecuteCommandTaskFormElement {
    serviceId: string;
}

export interface DefinitionAddCopyAssetIntoContainerTaskFormElement
    extends DefinitionAddAfterBuildTaskFormElement {
    serviceId: string;
    assetId: string;
    destinationPath: string;
}

export interface DefinitionAddBeforeBuildTaskFormElement {
    type: string;
}

export interface DefinitionAddCopyTaskFormElement
    extends DefinitionAddBeforeBuildTaskFormElement {
    sourceRelativePath: string;
    destinationRelativePath: string;
}

export interface DefinitionAddInterpolateTaskFormElement
    extends DefinitionAddBeforeBuildTaskFormElement {
    relativePath: string;
}
