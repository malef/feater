import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { NgxSpinnerService } from 'ngx-spinner';
import {
    getInstanceDetailProxyDomainsQueryGql,
    GetInstanceDetailProxyDomainsQueryInstanceFieldInterface,
    GetInstanceDetailProxyDomainsQueryInterface,
} from './get-instance-detail-proxy-domains.query';
import { Subscription, interval } from 'rxjs';

@Component({
    selector: 'app-instance-detail-proxy-domains',
    templateUrl: './instance-detail-proxy-domains.component.html',
    styles: [],
})
export class InstanceDetailProxyDomainsComponent implements OnInit, OnDestroy {
    private readonly POLLING_INTERVAL = 5000; // 5 seconds.

    instance: GetInstanceDetailProxyDomainsQueryInstanceFieldInterface;

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

    getServiceById(id) {
        for (const service of this.instance.services) {
            if (id === service.id) {
                return service;
            }
        }
    }

    protected getInstance(spinner = true) {
        if (spinner) {
            this.spinner.show();
        }
        this.apollo
            .watchQuery<GetInstanceDetailProxyDomainsQueryInterface>({
                query: getInstanceDetailProxyDomainsQueryGql,
                variables: {
                    id: this.route.snapshot.params['id'],
                },
            })
            .valueChanges.subscribe(result => {
                const resultData: GetInstanceDetailProxyDomainsQueryInterface =
                    result.data;
                this.instance = resultData.instance;
                if (spinner) {
                    this.spinner.hide();
                }
            });
    }
}
