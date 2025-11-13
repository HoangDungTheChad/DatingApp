import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Message } from '../../_models/message';
import { MessageService } from '../../_service/message.service';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AfterViewChecked, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-member-messages',
  imports: [NgFor, NgIf, NgFor, DatePipe, FormsModule, AsyncPipe, NgClass],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.css',
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageForm') messageForm: NgForm;
  @ViewChild('scrollMe', { static: false }) private messageContainer!:
    | ElementRef
    | undefined;

  // the username of ourself
  @Input() username: string;
  @Input() messages: Message[];
  messageContent: string;

  constructor(public messageService: MessageService) {
    this.messageService.messageThread$.subscribe({
      next: msgThread => {
        setTimeout(() => this.scrollToBottom(), 10); 
      }
    })
  }

  ngOnInit(): void {}

  // ngAfterViewChecked() {
  //   // when new message arrive, auto scroll to the bottom
  //   // but there's some problem with ngAfterViewCheck
  //   console.log('member message afterViewCheck runs');
  //   this.scrollToBottom();
  // }

  sendMessage() {
    this.messageService
      .sendMessage(this.username, this.messageContent)
      .then(() => {
        this.messageForm.reset();
      });
  }

  private scrollToBottom() {
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scroll({
        top: this.messageContainer.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }
}
