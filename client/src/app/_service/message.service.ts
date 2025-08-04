import { Injectable } from '@angular/core';
import { getPaginatedResult, getPaginationParams } from './paginationHelper';
import { Message } from '../_models/message';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl; 

  constructor(private http: HttpClient) { }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginationParams(pageNumber, pageSize)
    params = params.append('Container', container); 

    return getPaginatedResult<Message[]>(this.baseUrl + "messages", params, this.http);
  }

  getMessageThread(username: string) {
    return this.http.get<Message[]>(this.baseUrl + "messages/thread/" + username); 
  }

  sendMessage(username: string, content: string) {
    // we don't have to specify content: content, it's unnecessary 
    return this.http.post<Message>(this.baseUrl + "messages", {recipientUsername: username, content: content}); 
  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + "messages/" + id); 
  }
}
