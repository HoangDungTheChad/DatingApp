import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination } from '../_models/pagination';
import { MessageService } from '../_service/message.service';
import {
  AsyncPipe,
  DatePipe,
  NgFor,
  NgIf,
  TitleCasePipe,
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from 'ngx-bootstrap/pagination';
import { ConfirmService } from '../_service/confirm.service';
import { PresenceService } from '../_service/presence.service';
import { AccountService } from '../_service/account.service';
import { take } from 'rxjs';
import { User } from '../_models/user';

@Component({
  standalone: true,
  selector: 'app-messages',
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    ButtonsModule,
    PaginationComponent,
    RouterLink,
    TitleCasePipe,
    DatePipe,
    AsyncPipe,
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  container = 'Unread';
  pageNumber: number = 1;
  pageSize: number = 5;
  loading: boolean = false;
  toggleRefreshBtn: boolean = false;
  user: User; 

  constructor(
    public messageService: MessageService,
    private confirmService: ConfirmService,
    private presence: PresenceService,  
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        this.user = user; 
      }
    })
  }

  ngOnInit(): void {
    this.loadMessages();
    this.presence.newMessageArrived$.subscribe({
      next: (senderUsername) => {
        if (senderUsername && ['Unread', 'Inbox'].includes(this.container)) {
          this.toggleRefreshBtn = true;
        }
      },
    });
  }

  loadMessages() {
    this.loading = true;
    this.messageService
      .getMessages(this.pageNumber, this.pageSize, this.container)
      .subscribe({
        next: (res) => {
          this.messages = res.result;
          this.pagination = res.pagination;
          this.loading = false;
          this.toggleRefreshBtn = false;
        },
      });
  }

  deleteMessage(id: number) {
    this.confirmService
      .confirm('Confirm delete message', "This can't be undone")
      .subscribe((result) => {
        if (result) {
          this.messageService.deleteMessage(id).subscribe(() => {
            let deletedMessage =
              this.messages[this.messages.findIndex((m) => m.id === id)];

            // if the deleted message is unread & not sent by me, update the unread count
            if (deletedMessage.dateRead === null && deletedMessage.senderUsername != this.user.username) {
              this.messageService.updateUnreadCount(
                this.messageService.getCurrentUnreadCount() - 1
              );
            }

            // HTTP delete doesn't return anything to the client
            this.messages.splice(
              this.messages.findIndex((m) => m.id === id),
              1
            ); // delete from the client
          });
        }
      });
  }

  pageChanged(event: any) {
    if (this.pageNumber !== event.page) {
      // without this if statement, it causes our message retrieval to go into
      // an infinite loop of loading messages from the same page over and over
      // again
      this.pageNumber = event.page;
      this.loadMessages();
    }
  }

  updateReadCount(senderUserName) {
    // user has click to see all unread msg from this sender, update the unread count
    this.messageService.getUnreadCountFrom(senderUserName).subscribe({
      next: (res) => {
        this.messageService.updateUnreadCount(
          this.messageService.getCurrentUnreadCount() - res
        );
      },
    });
  }
}
