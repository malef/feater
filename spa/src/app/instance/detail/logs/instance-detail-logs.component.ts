import * as _ from 'lodash';
import * as moment from 'moment';
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

    readonly TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

    readonly COLLAPSED = 1;
    readonly EXPANDED = 2;

    instance: GetInstanceDetailLogsQueryInstanceFieldInterface;

    lastCommandLogEntryId: string = null;

    expandToggles: {[commandLogId: string]: number} = {};

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

    expand(commandLog: {id: string, completedAt?: Date}): void {
        this.expandToggles[commandLog.id] = this.EXPANDED;
    }

    collapse(commandLog: {id: string, completedAt?: Date}): void {
        this.expandToggles[commandLog.id] = this.COLLAPSED;
    }

    isExpanded(commandLog: {id: string, completedAt?: Date}): boolean {
        if (this.EXPANDED === this.expandToggles[commandLog.id]) {
            return true;
        }
        if (this.COLLAPSED === this.expandToggles[commandLog.id]) {
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
                this.updateLastCommandLogEntryId(resultData);
                this.instance = {
                    id: resultData.instance.id,
                    name: resultData.instance.name,
                    commandLogs: [],
                };
                for (const commandLogData of resultData.instance.commandLogs) {
                    this.addCommandLog(commandLogData);
                }

                this.spinner.hide();
            });
    }

    protected updateLastCommandLogEntryId(
        resultData: GetInstanceDetailLogsQueryInterface,
    ): void {
        const entryIds = _.map(
            _.flatten(
                resultData.instance.commandLogs.map((commandLog) => {
                    return commandLog.entries.length > 0
                        ? commandLog.entries.slice(-1)
                        : [];
                })
            ),
            'id'
        );
        if (0 !== entryIds.length) {
            this.lastCommandLogEntryId = _.max(entryIds);
        }
    }

    protected findCommandLog(commandLogId) {
        return _.find(this.instance.commandLogs, {id: commandLogId});
    }

    protected addCommandLog(commandLogData) {
        const commandLog = {
            id: commandLogData.id,
            description: commandLogData.description,
            createdAt: commandLogData.createdAt,
            completedAt: commandLogData.completedAt,
            failedAt: commandLogData.failedAt,
            entries: [],
        };
        this.instance.commandLogs.push(commandLog);
        this.addCommandLogEntries(commandLog, commandLogData.entries);
    }

    protected addCommandLogEntries(commandLog, commandLogEntriesData) {
        const commandLogEntries = _.cloneDeep(commandLogEntriesData);
        commandLog.entries = commandLogEntries;
    }

}
