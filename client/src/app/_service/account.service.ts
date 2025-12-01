import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, ReplaySubject } from 'rxjs';
import { User } from '../_models/user';
import { environment } from '../../environments/environment';
import { PresenceService } from './presence.service';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  // why use type Observable to retrieve user though? Because later in html template we'll take advantage of async pipe 
  private currentUserSource = new ReplaySubject<User | null>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient, private presence: PresenceService, private messageService: MessageService) {}

  login(model: any) {

    return this.http.post(this.baseUrl + 'account/login', model).pipe(
      map((res: User) => {
        const user = res;
        if (user) {
          this.setCurrentUser(user);
          this.presence.createHubConnection(user); 
          this.messageService.loadUnreadCount(); 
        }
      })
    );
  }

  register(model: any) {
    return this.http.post(this.baseUrl + 'account/register', model).pipe(
      map((user: User) => {
        this.setCurrentUser(user);
        this.presence.createHubConnection(user);
      })
    );
  }

  setCurrentUser(user: User) {
    if (user !== null) {
      user.roles = [];
      // note: the return role would be an array if the user take on multiple roles
      const roles = this.getDecodedToken(user.token).role;
      Array.isArray(roles) ? (user.roles = roles) : user.roles.push(roles);
    }

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
    this.presence.stopHubConnection();
  }

  getDecodedToken(token) {
    // decode the payload (the only part of JWT that we're interested in)
    return JSON.parse(atob(token.split('.')[1]));
  }
}
