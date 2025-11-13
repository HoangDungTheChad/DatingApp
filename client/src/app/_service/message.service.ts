import { Injectable } from '@angular/core';
import { getPaginatedResult, getPaginationParams } from './paginationHelper';
import { Message } from '../_models/message';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../_models/user';
import { BehaviorSubject, take } from 'rxjs';
import { Group } from '../_models/group';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  // the number of unread messages
  private unreadCountSource = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSource.asObservable();

  constructor(private http: HttpClient) {}

  createHubConnection(user: User, otherUsername: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error) => {
      console.log(error);
    });

    this.hubConnection.on('ReceiveMessageThread', (messages) => {
      this.messageThreadSource.next(messages);
    });

    this.hubConnection.on('NewMessage', (message) => {
      this.messageThread$.pipe(take(1)).subscribe((messages) => {
        // note: DO NOT modify the array, instead create a new one
        // that's why I use spread operator
        this.messageThreadSource.next([...messages, message]);
      });
    });

    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      // if other user just join to message group
      if (group.connections.some((x) => x.username == otherUsername)) {
        // update the read prop on messages they sent to us
        this.messageThread$.pipe(take(1)).subscribe((messages) => {
          messages.forEach((msg) => {
            if (!msg.dateRead) msg.dateRead = new Date(Date.now());
          });
          this.messageThreadSource.next([...messages]);
        });
      }
    });
  }

  stopHubConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  // to display in the Messages Component (Inbox, Outbox, Unread)
  getMessages(pageNumber: number, pageSize: number, container: string) {
    // don't worry, jwt token will be added later in the http pipeline
    let params = getPaginationParams(pageNumber, pageSize);
    params = params.append('Container', container);

    return getPaginatedResult<Message[]>(
      this.baseUrl + 'messages',
      params,
      this.http
    );
  }

  // to display in the member-message component, unnecessary because now we use SigalR
  // getMessageThread(username: string) {
  //   return this.http.get<Message[]>(
  //     this.baseUrl + 'messages/thread/' + username
  //   );
  // }

  // async keyword makes sure that the return value is a Promise
  async sendMessage(username: string, content: string) {
    // to execute a hub method on the server, user invoke. this is no longer a http req
    // so we to catch error ourself without help from error interceptor
    return this.hubConnection
      .invoke('SendMessage', { recipientUsername: username, content: content })
      .catch((error) => console.log(error));

    // return this.http.post<Message>(this.baseUrl + 'messages', {
    //   recipientUsername: username,
    //   content: content,
    // });
  }

  // calling this func inside constructor will cause Circular DI injection error in account service
  //, call it later inside AccountService.login() 
  loadUnreadCount() {
    this.http.get<number>(this.baseUrl + 'messages/unread-count').subscribe({
      next: (res) => {
        this.unreadCountSource.next(res);
      },
    });
  }

  getCurrentUnreadCount() {
    return this.unreadCountSource.value;
  }

  getUnreadCountFrom(senderUsername: string) {
    return this.http.get<number>(this.baseUrl + "messages/unread-count-from/" + senderUsername); 
  }

  updateUnreadCount(newValue: number) {
    this.unreadCountSource.next(newValue);
  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
