import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Member } from '../_models/member';
import { isPlatformBrowser } from '@angular/common';
import { map, Observable, of, take } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { User } from '../_models/user';
import { getPaginatedResult, getPaginationParams } from './paginationHelper';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  isBrowser: boolean = false;
  members: Member[] = [];
  memberCache: Map<any, any> = new Map();
  // keeping track of all member that I already liked 
  likedUsers: Member[] = [];

  user: User;
  userParams: UserParams;

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {}

  initializeUserParams() {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (user: User) => {
        this.user = user;
        this.userParams = new UserParams(user);
      },
    });
  }

  setUser(user: User) {
    this.user = user;
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(userParams: UserParams) {
    this.userParams = userParams;
  }

  resetUserParams() {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams) {
    let response = this.memberCache.get(Object.values(userParams).join('-'));
    if (response) {
      return of(response);
    }

    let params = getPaginationParams(
      userParams.pageNumber,
      userParams.pageSize
    );

    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return getPaginatedResult<Member[]>(
      this.baseUrl + 'users',
      params,
      this.http
    ).pipe(
      map((response) => {
        this.memberCache.set(Object.values(userParams).join('-'), response);
        return response;
      })
    );
  }

  // MemberListComponent need this infomation 
  getLikedMembers() {
    this.http.get<Member[]>(this.baseUrl + 'likes/liked-users').subscribe({
      next: (res) => {
        // A list of likeDto with only username as property 
        this.likedUsers = res;
      },
    });
  }

  getMember(username: string): Observable<Member> {
    const member = Array.from(this.memberCache.values())
      .reduce((arr, el) => arr.concat(el.result), [])
      .find((member: Member) => member.username == username);

    if (member) {
      return of(member);
    }

    return this.http.get<Member>(this.baseUrl + `users/${username}`);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

  addLike(username) {
    return this.http.post(this.baseUrl + 'likes/add-like/' + username, {});
  }

  getLikes(predicate, pageNumber, pageSize) {
    let params = getPaginationParams(pageNumber, pageSize);
    params = params.append('predicate', predicate);
    return getPaginatedResult<Member[]>(
      this.baseUrl + 'likes/likes-pagination',
      params,
      this.http
    );
  }

  removeLike(username, relType) {
    return this.http.delete(this.baseUrl + 'likes/remove-like/' + username, {
      params: { relationshipType: relType },
    });
  }
}
