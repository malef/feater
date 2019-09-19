import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import gql from 'graphql-tag';
import {Apollo} from 'apollo-angular';
import {NgxSpinnerService} from 'ngx-spinner';
import {InstanceAddForm} from './instance-add-form.model';
import {
    GetDefinitionQueryDefinitionFieldInterface,
    GetDefinitionQueryInterface,
    getDefinitionQueryGql,
} from './get-definition.query';
import {getDefinitionDetailQueryGql} from '../../definition/detail/get-definition-detail.query';
import {getInstanceListQueryGql} from '../list/get-instance-list.query';
import {getDefinitionListQueryGql} from '../../definition/list/get-definition-list.query';


@Component({
    selector: 'app-instance-add',
    templateUrl: './instance-add.component.html',
    styles: []
})
export class InstanceAddComponent implements OnInit {

    protected readonly mutation = gql`
        mutation ($definitionId: String!, $instantiationActionId: String!, $name: String!) {
            createInstance(definitionId: $definitionId, instantiationActionId: $instantiationActionId, name: $name) {
                id
            }
        }
    `;

    item: InstanceAddForm;

    definition: GetDefinitionQueryDefinitionFieldInterface;

    instantiationActions: { id: string; name: string; type: string; }[] = [];

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected apollo: Apollo,
        protected spinner: NgxSpinnerService,
    ) {
        this.item = {
            name: ''
        };
    }

    ngOnInit() {
        this.getDefinition();
    }

    addItem(instantiationActionId: string) {
        this.apollo.mutate({
            mutation: this.mutation,
            variables: {
                definitionId: this.definition.id,
                name: this.item.name,
                instantiationActionId,
            },
        }).subscribe(
            ({data}) => {
                this.router.navigate(['/instance', data.createInstance.id]);
            },
            (error) => {
                console.log(error);
            }
        );
    }

    protected getDefinition() {
        this.spinner.show();
        this.apollo
            .watchQuery<GetDefinitionQueryInterface>({
                query: getDefinitionQueryGql,
                variables: {
                    id: this.route.snapshot.params['id'],
                },
            })
            .valueChanges
            .subscribe(result => {
                const resultData: GetDefinitionQueryInterface = result.data;
                this.definition = resultData.definition;
                this.instantiationActions = this.definition.config.actions.filter(
                    function (action) {
                        return 'instantiation' === action.type;
                    }
                );
                this.spinner.hide();
            });
    }

}
