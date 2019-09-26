import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Apollo} from 'apollo-angular';
import {NgxSpinnerService} from 'ngx-spinner';
import {
    getInstanceDetailSummaryQueryGql,
    GetInstanceDetailSummaryQueryInstanceFieldInterface,
    GetInstanceDetailSummaryQueryInterface,
} from './get-instance-detail-summary.query';
import {Subscription, interval} from 'rxjs';
import gql from 'graphql-tag';

@Component({
    selector: 'app-instance-detail-summary',
    templateUrl: './instance-detail-summary.component.html',
    styles: []
})
export class InstanceDetailSummaryComponent implements OnInit, OnDestroy {

    private readonly POLLING_INTERVAL = 5000; // 5 seconds.

    instance: GetInstanceDetailSummaryQueryInstanceFieldInterface;

    pollingSubscription: Subscription;

    modificationActions: { id: string; name: string; type: string; }[] = [];

    protected readonly modifyInstanceMutation = gql`
        mutation ($instanceId: String!, $modificationActionId: String!) {
            modifyInstance(instanceId: $instanceId, modificationActionId: $modificationActionId) {
                id
            }
        }
    `;

    protected readonly removeInstanceMutation = gql`
        mutation ($id: String!) {
            removeInstance(id: $id)
        }
    `;

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected apollo: Apollo,
        protected spinner: NgxSpinnerService,
    ) {}

    ngOnInit() {
        this.getInstance();
        this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe(
            () => { this.getInstance(false); },
        );
    }

    ngOnDestroy() {
        this.pollingSubscription.unsubscribe();
    }

    modifyInstance(modificationActionId: string) {
        if (this.isModificationDisabled()) {
            return;
        }

        this.apollo
            .mutate({
                mutation: this.modifyInstanceMutation,
                variables: {
                    instanceId: this.instance.id,
                    modificationActionId,
                },
            }).subscribe(
                () => { this.getInstance(false); },
                (error) => { console.log(error); }
            );
    }

    isModificationDisabled(): boolean {
        return (
            !this.instance
            || !this.instance.isModificationAllowed
            || (!this.instance.completedAt && !this.instance.failedAt)
        );
    }

    getModificationDisabledReason(): string {
        if (this.instance && !this.instance.isModificationAllowed) {
            return 'Related definition was changed after creating this instance.'
        }
        if (this.instance && !this.instance.completedAt && !this.instance.failedAt) {
            return 'Some action is already in progress.'
        }

        return '';
    }

    removeInstance() {
        this.apollo
            .mutate({
                mutation: this.removeInstanceMutation,
                variables: {
                    id: this.instance.id,
                },
            }).subscribe(
                () => {
                    this.router.navigateByUrl(`/definition/${this.instance.definition.id}`);
                }
            );
    }

    protected getInstance(spinner = true) {
        if (spinner) {
            this.spinner.show();
        }
        this.apollo
            .watchQuery<GetInstanceDetailSummaryQueryInterface>({
                query: getInstanceDetailSummaryQueryGql,
                variables: {
                    id: this.route.snapshot.params['id'],
                },
            })
            .valueChanges
            .subscribe(result => {
                const resultData: GetInstanceDetailSummaryQueryInterface = result.data;
                this.instance = resultData.instance;
                this.modificationActions = this.instance.definition.config.actions.filter(
                    function (action) {
                        return 'modification' === action.type;
                    }
                );
                if (spinner) {
                    this.spinner.hide();
                }
            });
    }

}
