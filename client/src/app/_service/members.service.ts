import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Member } from '../_models/member';
import { isPlatformBrowser } from '@angular/common';
import { map, of } from 'rxjs';

let httpOptions = {
  headers: undefined,
};

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);
  isBrowser: boolean = false;
  members: Member[] = [];

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      httpOptions.headers = new HttpHeaders({
        Authorization:
          'Bearer ' + JSON.parse(localStorage.getItem('user'))?.token,
      });
    }
  }

  getMembers() {
    if (this.members.length > 0) return of(this.members);
    return this.http.get<Member[]>(this.baseUrl + 'users', httpOptions).pipe(
      map((members) => {
        this.members = members;
        return members;
      })
    );
  }
  getMember(username: string) {
    const member = this.members.find((x) => x.userName === username);
    if (member !== undefined) return of(member);
    return this.http.get<Member>(
      this.baseUrl + `users/${username}`,
      httpOptions
    );
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);  
        this.members[index] = member; 
      })
    );
  }
}
