import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsersWithRoles() {
    // because we only return some of the properties of the user  
    return this.http.get<any>(this.baseUrl + "admin/users-with-roles"); 
  }

  updateUserRoles(username: string, roles: string[]) {
    return this.http.post(this.baseUrl + "admin/edit-roles/" + username + "?roles=" + roles, {})
  }
}
