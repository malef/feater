/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InstanceDetailDownloadablesComponent } from './instance-detail-downloadables.component';

describe('InstanceDetailDownloadablesComponent', () => {
    let component: InstanceDetailDownloadablesComponent;
    let fixture: ComponentFixture<InstanceDetailDownloadablesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InstanceDetailDownloadablesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InstanceDetailDownloadablesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
