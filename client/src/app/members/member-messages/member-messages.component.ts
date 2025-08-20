import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Message } from '../../_models/message';
import { MessageService } from '../../_service/message.service';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-messages',
  imports: [NgFor, NgIf, NgFor, DatePipe, FormsModule, AsyncPipe],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.css',
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild("messageForm") messageForm: NgForm; 
  // the username of ourself 
  @Input() username: string; 
  @Input() messages: Message[]; 
  messageContent: string; 

  constructor(public messageService: MessageService) {}

  ngOnInit(): void {}

  sendMessage() {
    this.messageService.sendMessage(this.username, this.messageContent).then(() => {
      this.messageForm.reset(); 
    })
  }
}
