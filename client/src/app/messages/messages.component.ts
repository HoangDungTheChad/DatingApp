import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination } from '../_models/pagination';
import { MessageService } from '../_service/message.service';
import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from 'ngx-bootstrap/pagination';
import { ConfirmService } from '../_service/confirm.service';

@Component({
  standalone: true, 
  selector: 'app-messages',
  imports: [NgIf, NgFor, FormsModule, ButtonsModule, PaginationComponent,  RouterLink, TitleCasePipe, DatePipe],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit{
  messages: Message[];  
  pagination: Pagination;  
  container =  'Unread'; 
  pageNumber: number = 1;  
  pageSize: number = 5; 
  loading: boolean = false;  

  constructor(private messageService: MessageService, private confirmService: ConfirmService) {}

  ngOnInit(): void {
    this.loadMessages(); 
  }

  loadMessages() {
    this.loading = true 
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container).subscribe({
      next: res => {
        this.messages = res.result;  
        this.pagination = res.pagination; 
        this.loading = false; 
      }
    })
  }

  deleteMessage(id: number) {
    this.confirmService.confirm("Confirm delete message", "This can't be undone").subscribe(result => {
      if (result) {
        this.messageService.deleteMessage(id).subscribe(() => {
        // HTTP delete doesn't return anything to the client  
        this.messages.splice(this.messages.findIndex(m => m.id === id), 1); // delete from the client 
        })
      }
    })

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
}
