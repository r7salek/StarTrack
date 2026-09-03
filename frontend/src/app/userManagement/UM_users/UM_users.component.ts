import { UM_HelperService } from './../helper_services/UM_Helper.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserData, User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UpdateUserComponent } from '../UpdateUser/UpdateUser.component';

@Component({
  selector: 'app-UM_users',
  templateUrl: './UM_users.component.html',
  styleUrls: ['./UM_users.component.scss']
})
export class UM_usersComponent implements OnInit {

  userData: UserData[] = []; // Defining data array
  public editUser!: User;
  userUpdateRoleDialogRef: MatDialogRef<UpdateUserComponent> | undefined;
  // Defining the columns for table
  public displayedColumns2: string[] = [
    'firstName',
    'lastName',
    'email',
    'createdDate',
    'modifiedDate',
    'role',
    'update',
    'deleteUser',
    'resetPassword',
  ];
  // Defining Datasource , pagination and sorting
  public dataSource2 = new MatTableDataSource<UserData>();
  @ViewChild('TableTwoPaginator', { static: true })
  tableTwoPaginator!: MatPaginator;
  @ViewChild('TableTwoSort', { static: true }) tableTwoSort!: MatSort;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  userToUpdate = {
    enabled: '',
  };
  constructor(
    private userService: UserService, // Service responsible for API data from database
    public notificationService: NotificationService, // Service contains logic of notification
    private dialog: MatDialog, // Dialog box
    public um_HelperService: UM_HelperService // Helper service class for user management
  ) {}

  ngOnInit() {
    this.getUserData();
    this.dataSource2.paginator = this.tableTwoPaginator;
    this.dataSource2.sort = this.tableTwoSort;
  }
  // Getting all the user from database
  getUserData() {
    this.userService.getUserData().subscribe(
      (res1) => {
        if (!!res1) {
          this.dataSource2.data = res1.filter((res) => res.enabled === true);
        }
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }
  // Filtering data from table
  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
  }
  // Open Dialog box for user role modification
  onEdit(row: any) {
    if (row.role && typeof row.role === 'string') {
      // Check if row.role contains a comma
      if (row.role.includes(',')) {
        // Split 'row.role' into an array using the comma as the delimiter
        row.role = row.role.split(',').map((role: string) => role.trim());
      } else {
        // If there is no comma, convert row.role to a single-element array
        row.role = [row.role.trim()];
      }
    } else if (!Array.isArray(row.role)) {
      // If row.role is not a string or an array, convert it to an empty array
      row.role = [];
    }
    this.userService.populateForm(row);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '50%';
    dialogConfig.height = '30%';
    this.dialog.open(UpdateUserComponent, dialogConfig);
  }

}
