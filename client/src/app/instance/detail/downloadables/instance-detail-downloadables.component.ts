import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { NgxSpinnerService } from 'ngx-spinner';
import {
    getInstanceDetailDownloadablesQueryGql,
    GetInstanceDetailDownloadablesQueryInstanceFieldInterface,
    GetInstanceDetailDownloadablesQueryInterface,
} from './get-instance-detail-downloadables.query';
import { Subscription, interval } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-instance-detail-downloadables',
    templateUrl: './instance-detail-downloadables.component.html',
    styles: [],
})
export class InstanceDetailDownloadablesComponent implements OnInit, OnDestroy {
    private readonly POLLING_INTERVAL = 5000; // 5 seconds.

    instance: GetInstanceDetailDownloadablesQueryInstanceFieldInterface;

    pollingSubscription: Subscription;

    constructor(
        protected route: ActivatedRoute,
        protected apollo: Apollo,
        protected spinner: NgxSpinnerService,
    ) {}

    ngOnInit() {
        this.getInstance();
        this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe(
            () => {
                this.getInstance(false);
            },
        );
    }

    ngOnDestroy() {
        this.pollingSubscription.unsubscribe();
    }

    getDownloadUrl(downloadable: { id: string }): string {
        return environment.downloadableDownloadUrl
            .replace(':instanceId', this.instance.id)
            .replace(':downloadableId', downloadable.id);
    }

    protected getInstance(spinner = true) {
        if (spinner) {
            this.spinner.show();
        }
        this.apollo
            .watchQuery<GetInstanceDetailDownloadablesQueryInterface>({
                query: getInstanceDetailDownloadablesQueryGql,
                variables: {
                    id: this.route.snapshot.params['id'],
                },
            })
            .valueChanges.subscribe(result => {
                const resultData: GetInstanceDetailDownloadablesQueryInterface =
                    result.data;
                this.instance = resultData.instance;
                if (spinner) {
                    this.spinner.hide();
                }
            });
    }
}
