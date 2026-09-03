/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UM_usersComponent } from './UM_users.component';

describe('UM_usersComponent', () => {
  let component: UM_usersComponent;
  let fixture: ComponentFixture<UM_usersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UM_usersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UM_usersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
