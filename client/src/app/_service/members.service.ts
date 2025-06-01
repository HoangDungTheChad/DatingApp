import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Member } from '../_models/member';
import { isPlatformBrowser } from '@angular/common';
import { UntypedFormBuilder } from '@angular/forms';

let httpOptions = {
  headers: undefined
};

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  private platformId = inject(PLATFORM_ID)
  isBrowser: boolean = false; 

  constructor(private http: HttpClient) {
    if (isPlatformBrowser(this.platformId)) {
      httpOptions.headers = new HttpHeaders({
        Authorization: "Bearer " + JSON.parse(localStorage.getItem("user"))?.token
      })
    }
  }

  getMembers() {
    return this.http.get<Member[]>(this.baseUrl + 'users', httpOptions);
  }
  getMember(username: string) {
    return this.http.get<Member>(this.baseUrl + `users/${username}`, httpOptions); 
  }
}
