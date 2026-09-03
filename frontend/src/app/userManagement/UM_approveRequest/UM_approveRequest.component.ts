import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { UM_HelperService } from '../helper_services/UM_Helper.service';
import { User } from '../../models/user';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-UM_approveRequest',
  templateUrl: './UM_approveRequest.component.html',
  styleUrls: ['./UM_approveRequest.component.scss']
})
export class UM_approveRequestComponent implements OnInit {
  // Defining the DataSource Fields
  public displayedColumns1: string[] = [
    'firstName',
    'lastName',
    'email',
    'createdDate',
    'accept',
    'deny',
  ];
  // Defining the data source for the table
  public dataSource1 = new MatTableDataSource<User>();
  @ViewChild('TableOnePaginator', { static: true })
  tableOnePaginator!: MatPaginator;
  @ViewChild('TableOneSort', { static: true }) tableOneSort!: MatSort;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  constructor(
    private userService: UserService, // Service use to get API data
    public notificationService: NotificationService, // Service responsible for notification logic
    public um_HelperService: UM_HelperService // Helper class for user management
  ) { }

  ngOnInit() {
    this.getUserApprovalData();
    this.dataSource1.paginator = this.tableOnePaginator;
    this.dataSource1.sort = this.tableOneSort;
  }
  // Get All use data From Rest API from Server
  getUserApprovalData() {
    this.userService.getUserApprovalData().subscribe(
      (res1) => {
        if (!!res1) {
          //Look for the records whos are pending for approval
          this.dataSource1.data = res1.filter((res) => res.enabled === false);
        }
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }
  //Filter the data into Table
  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }
}
