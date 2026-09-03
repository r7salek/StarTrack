import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { TokenStorageService } from '../../core/login/_services/token-storage.service';
import { EditedUserProfileComponent } from './EditedUserProfile.component';


describe('EditedUserProfileComponent', () => {

  let component: EditedUserProfileComponent;
  let fixture: ComponentFixture<EditedUserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditedUserProfileComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: TokenStorageService,
          useValue: { getUser: () => ({}) },
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {

    fixture = TestBed.createComponent(EditedUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
