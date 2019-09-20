import * as _ from 'lodash';
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Apollo} from 'apollo-angular';
import {NgxSpinnerService} from 'ngx-spinner';
import {
    getInstanceDetailLogsQueryGql,
    GetInstanceDetailLogsQueryInstanceFieldInterface,
    GetInstanceDetailLogsQueryInterface,
} from './get-instance-detail-logs.query';

@Component({
    selector: 'app-instance-detail-logs',
    templateUrl: './instance-detail-logs.component.html',
    styles: []
})
export class InstanceDetailLogsComponent implements OnInit {

    readonly COLLAPSED = 1;
    readonly EXPANDED = 2;

    instance: GetInstanceDetailLogsQueryInstanceFieldInterface;

    expandActionLogToggles: {[actionLogId: string]: number} = {};

    expandCommandLogToggles: {[commandLogId: string]: number} = {};

    constructor(
        protected route: ActivatedRoute,
        protected apollo: Apollo,
        protected spinner: NgxSpinnerService,
    ) {}

    ngOnInit() {
        this.getInstance();
    }

    joinMessages(commandLogEntries) {
        return commandLogEntries
            .map((commandLogEntry) => {
                return commandLogEntry.message;
            })
            .join('\n');
    }

    trackById(index: number, obj: any): any {
        return obj.id;
    }

    expandActionLog(actionLog: {id: string, completedAt?: Date}): void {
        this.expandActionLogToggles[actionLog.id] = this.EXPANDED;
    }

    collapseActionLog(actionLog: {id: string, completedAt?: Date}): void {
        this.expandActionLogToggles[actionLog.id] = this.COLLAPSED;
    }

    isActionLogExpanded(actionLog: {id: string, completedAt?: Date}): boolean {
        if (this.EXPANDED === this.expandActionLogToggles[actionLog.id]) {
            return true;
        }
        if (this.COLLAPSED === this.expandActionLogToggles[actionLog.id]) {
            return false;
        }

        return !actionLog.completedAt;
    }

    expandCommandLog(commandLog: {id: string, completedAt?: Date}): void {
        this.expandCommandLogToggles[commandLog.id] = this.EXPANDED;
    }

    collapseCommandLog(commandLog: {id: string, completedAt?: Date}): void {
        this.expandCommandLogToggles[commandLog.id] = this.COLLAPSED;
    }

    isCommandLogExpanded(commandLog: {id: string, completedAt?: Date}): boolean {
        if (this.EXPANDED === this.expandCommandLogToggles[commandLog.id]) {
            return true;
        }
        if (this.COLLAPSED === this.expandCommandLogToggles[commandLog.id]) {
            return false;
        }

        return !commandLog.completedAt;
    }

    protected getInstance() {
        this.spinner.show();
        this.apollo
            .watchQuery<GetInstanceDetailLogsQueryInterface>({
                query: getInstanceDetailLogsQueryGql,
                variables: {
                    id: this.route.snapshot.params['id'],
                },
            })
            .valueChanges
            .subscribe(result => {
                const resultData: GetInstanceDetailLogsQueryInterface = result.data;
                this.instance = {
                    id: resultData.instance.id,
                    name: resultData.instance.name,
                    actionLogs: [],
                };
                for (const actionLogData of resultData.instance.actionLogs) {
                    this.addActionLog(actionLogData);
                }

                this.spinner.hide();
            });
    }

    protected addActionLog(actionLogData) {
        const actionLog = {
            id: actionLogData.id,
            actionId: actionLogData.actionId,
            actionType: actionLogData.actionType,
            actionName: actionLogData.actionName,
            createdAt: actionLogData.createdAt,
            completedAt: actionLogData.completedAt,
            failedAt: actionLogData.failedAt,
            commandLogs: [],
        };
        this.instance.actionLogs.push(actionLog);
        for (const commandLogData of actionLogData.commandLogs) {
            this.addCommandLog(actionLog, commandLogData);
        }
    }

    protected addCommandLog(actionLog, commandLogData) {
        const commandLog = {
            id: commandLogData.id,
            description: commandLogData.description,
            createdAt: commandLogData.createdAt,
            completedAt: commandLogData.completedAt,
            failedAt: commandLogData.failedAt,
            entries: [],
        };
        actionLog.commandLogs.push(commandLog);
        this.addCommandLogEntries(commandLog, commandLogData.entries);
    }

    protected addCommandLogEntries(commandLog, commandLogEntriesData) {
        const commandLogEntries = _.cloneDeep(commandLogEntriesData);
        commandLog.entries = commandLogEntries;
    }

}
