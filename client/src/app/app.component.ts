import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { AccountService } from './_service/account.service';
import { PLATFORM_ID } from '@angular/core';
import { User } from './_models/user';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PresenceService } from './_service/presence.service';
import { MessageService } from './_service/message.service';
import { ThumbnailsPosition } from 'ng-gallery';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavComponent, RouterOutlet, NgIf, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  title = 'The Dating App';
  userLoaded = false;

  constructor(
    private accountService: AccountService,
    private presence: PresenceService,
    private messageService: MessageService
  ) {}

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
    if (!isPlatformBrowser(this.platformId)) return;

    const userString = localStorage.getItem('user');
    if (!userString || userString === 'null' || userString.trim() === '') {
      this.accountService.setCurrentUser(null);
    } else {
      const user: User = JSON.parse(userString);
      this.accountService.setCurrentUser(user);
      this.presence.createHubConnection(user); // create the hub connnection use is set
      this.messageService.loadUnreadCount();
    }
  }
}
