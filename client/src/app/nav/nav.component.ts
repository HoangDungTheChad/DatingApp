import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_service/account.service';
import { NgIf } from '@angular/common';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [
    FormsModule, NgIf, BsDropdownModule, 
    AsyncPipe, RouterLink, TitleCasePipe
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent implements OnInit {
  model: any = {};
  currentUser$: Observable<User>;
  userLoaded = false;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.accountService.currentUser$;
  }

  login() {
    this.accountService.login(this.model).subscribe({
      next: (res) => {
        this.router.navigateByUrl('/members');
      },
      error: (error) => {
        this.toastr.error(error.error); 
        console.log(error); 
      },
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
