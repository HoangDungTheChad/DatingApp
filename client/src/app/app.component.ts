import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { error } from 'console';
import { NgFor, NgIf } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { User } from './_models/user';
import { AccountService } from './_service/account.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HomeComponent } from './home/home.component';

@Component({
  selector: 'app-root',
  imports: [
    NavComponent, HomeComponent, 
    RouterOutlet, NgFor, NgIf
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  title = 'The Dating App';
  userLoaded = false; 

  constructor(
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.setCurrentUser();

    // waiting for the first emission then allow rendering 
    this.accountService.currentUser$.subscribe({
      next: user => {
        this.userLoaded = true; 
      }
    })
  }

  setCurrentUser() {
    if (isPlatformBrowser(this.platformId)) {
      const user: User = JSON.parse(localStorage.getItem('user'));
      this.accountService.setCurrentUser(user);
    }
  }
}
