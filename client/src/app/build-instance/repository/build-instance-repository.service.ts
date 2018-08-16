import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import {BuildInstance, MappedBuildInstance} from '../build-instance.model';
import { BuildInstanceAddForm } from '../build-instance-add-form.model';

@Injectable()
export class BuildInstanceRepositoryService {

    private itemsUrl = 'http://localhost:3000/api/build-instance';

    constructor(private http: Http) {}

    getItems() : Observable<BuildInstance[]> {
        return this.http
            .get(this.itemsUrl)
            .map((res) : BuildInstance[] => res.json().data)
            .catch(this.handleError);
    }

    getItem(id) : Observable<BuildInstance> {
        return this.http
            .get([this.itemsUrl, id].join('/'))
            .map((res) : BuildInstance => res.json().data)
            .catch(this.handleError);
    }

    addItem(addForm : BuildInstanceAddForm) : Observable<string> {
        return this.http
            .post(this.itemsUrl, addForm)
            .map((res) : string => res.json().data.id)
            .catch(this.handleError);
    }

    removeItem(item : MappedBuildInstance) : Observable<string> {
        return this.http
            .delete(`${this.itemsUrl}/${item._id}`)
            .map((res) : string => res.json().data.removed)
            .catch(this.handleError);
    }

    private handleError(error: Response | any) {
        // TODO
        console.log('Error in build instance repository', error);

        return Observable.throw('Error in build instance repository');
    }
}
