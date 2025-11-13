import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { ToastrService } from 'ngx-toastr';
import { User } from '../_models/user';
import { BehaviorSubject, take } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from './message.service';
import { Message } from '../_models/message';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  // a string array of all online user's usernames 
  // use it for member-card, member-detail, ... 
  private onlineUsersSource = new BehaviorSubject<string[]>([]); 
  public onlineUsers$ = this.onlineUsersSource.asObservable(); 
  
  // this is for messages component, subscribe to toggle the refresh mailbox btn 
  private newMessageArrivedSource = new BehaviorSubject<string | null>(null); 
  newMessageArrived$ = this.newMessageArrivedSource.asObservable();  

  constructor(private toastr: ToastrService, private router: Router, private messageService: MessageService) {}

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + "presence", {
        accessTokenFactory: () => user.token 
      })
      .withAutomaticReconnect()
      .build(); 

    this.hubConnection 
      .start() 
      .catch(error => console.log(error)); 

    this.hubConnection.on('UserIsOnline', username => {
      // this.toastr.info(username + "has connected");  
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        this.onlineUsersSource.next([...usernames, username]); 
      })
    }); 

    this.hubConnection.on("UserIsOffline", username => {
      // this.toastr.warning(username + "has disconnected");  
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        this.onlineUsersSource.next([...usernames.filter(x => x !== username)]); 
      })
    }); 

    this.hubConnection.on("GetOnlineUsers", (users: string[]) => {
      this.onlineUsersSource.next(users);  
    }); 

    this.hubConnection.on("NewMessageReceived", ({username, knownAs}) => {
      // parameter name has to be matched with payload 
      this.toastr.info(`${knownAs} has sent you a new message`)
        .onTap 
        .pipe(take(1)) 
        .subscribe(() => {
          this.router.navigateByUrl("/members/" + username + "?tab=3"); 
        }); 
      // update the unread count  
      this.messageService.updateUnreadCount(this.messageService.getCurrentUnreadCount() + 1); 
      // subscribe in messages component to toggle refresh mailbox btn  
      this.newMessageArrivedSource.next(username); 
    }); 
  }

  stopHubConnection() {
    this.hubConnection.stop().catch(error => console.log(error)); 
  }
}
