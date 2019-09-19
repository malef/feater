export interface InstantiationContextAfterBuildTaskInterface {
    readonly type: string;
    readonly id?: string;
    readonly dependsOn?: string[];
}
