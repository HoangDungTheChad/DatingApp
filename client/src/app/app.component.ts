import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { AccountService } from './_service/account.service';
import { PLATFORM_ID } from '@angular/core';
import { User } from './_models/user';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [NavComponent, RouterOutlet, NgIf, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  title = 'The Dating App';
  userLoaded = false;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.setCurrentUser();

    // waiting for the first emission then allow rendering
    this.accountService.currentUser$.subscribe({
      next: (user) => {
        this.userLoaded = true;
      },
    });
  }

  setCurrentUser() {
    if (isPlatformBrowser(this.platformId)) {
      const userString = localStorage.getItem('user');
      if (!userString) {
        this.accountService.setCurrentUser(null);
      }
      const user: User = JSON.parse(userString);
      this.accountService.setCurrentUser(user);
    }
  }
}
