import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Apollo} from 'apollo-angular';
import {NgxSpinnerService} from 'ngx-spinner';
import {
    getInstanceDetailEnvironmentQueryGql,
    GetInstanceDetailEnvironmentQueryInstanceFieldInterface,
    GetInstanceDetailEnvironmentQueryInterface,
} from './get-instance-detail-environment.query';
import {Subscription, interval} from 'rxjs';

@Component({
    selector: 'app-instance-detail-environment',
    templateUrl: './instance-detail-environment.component.html',
    styles: []
})
export class InstanceDetailEnvironmentComponent implements OnInit, OnDestroy {

    private readonly POLLING_INTERVAL = 5000; // 5 seconds.

    instance: GetInstanceDetailEnvironmentQueryInstanceFieldInterface;

    pollingSubscription: Subscription;

    constructor(
        protected route: ActivatedRoute,
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

    protected getInstance(spinner: boolean = true) {
        if (spinner) {
            this.spinner.show();
        }
        this.apollo
            .watchQuery<GetInstanceDetailEnvironmentQueryInterface>({
                query: getInstanceDetailEnvironmentQueryGql,
                variables: {
                    id: this.route.snapshot.params['id'],
                },
            })
            .valueChanges
            .subscribe(result => {
                const resultData: GetInstanceDetailEnvironmentQueryInterface = result.data;
                this.instance = resultData.instance;
                if (spinner) {
                    this.spinner.hide();
                }
            });
    }

}
