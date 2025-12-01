import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MembersService } from '../../_service/members.service';
import { Member } from '../../_models/member';
import { AsyncPipe, NgIf } from '@angular/common';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { DatePipe } from '@angular/common';
import { TimeagoModule } from 'ngx-timeago';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { Message } from '../../_models/message';
import { MessageService } from '../../_service/message.service';
import { PresenceService } from '../../_service/presence.service';
import { AccountService } from '../../_service/account.service';
import { User } from '../../_models/user';
import { mapMember } from '../../_helpers/utils';
import { MemberGalleryComponent } from '../member-gallery/member-gallery.component';
import { ImageItem } from '../../_helpers/image-item';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [
    TabsModule,
    MemberGalleryComponent,
    DatePipe,
    TimeagoModule,
    MemberMessagesComponent,
    AsyncPipe,
    NgIf,
  ],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css',
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', { static: true }) memberTabs: TabsetComponent; // this component is provided by ngx-bootstrap
  member: Member;
  images: ImageItem[] = [];
  activeTab: TabDirective;
  messages: Message[] = [];
  user: User;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private accountService: AccountService,
    public presence: PresenceService,
    private router: Router,  
    private memberService: MembersService, 
    private toastr: ToastrService
  ) {
    this.accountService.currentUser$.subscribe({
      next: (user) => (this.user = user),
    });
    // stop using the route reuse strategy
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    // we no longer need loadMember
    // this.loadMember();
    this.route.data.subscribe({
      next: (data) => {
        this.member = mapMember(data.member);
      },
    });

    this.route.queryParams.subscribe({
      next: (params) => {
        params.tab ? this.selectTab(params.tab) : this.selectTab(0);
      },
    });

    this.getImages();
  }

  addLike() {
    this.memberService.addLike(this.member.username).subscribe(() => {
      this.toastr.success('You have liked ' + this.member.knownAs);
      // update the liked user list in the service
      this.memberService.likedUsers.push({ username: this.member.username } as Member);
    });
  }

  getImages() {
    // set items array
    for (let photo of this.member.photos) {
      this.images.push(new ImageItem(photo.url, photo.url));
    }
  }

  // loadMember() {
  //   this.membersService
  //     .getMember(this.route.snapshot.paramMap.get('username'))
  //     .subscribe((member) => {
  //       this.member = member;
  //       this.getImages();
  //     });
  // }

  // loadMessages() {
  //   this.messageService.getMessageThread(this.member.username).subscribe({
  //     next: (res) => {
  //       this.messages = res;
  //     },
  //   });
  // }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data; // so we have access to information inside that tab

    if (this.activeTab.heading == 'Messages' && this.messages.length === 0) {
      this.messageService.createHubConnection(this.user, this.member.username);
    } else {
      this.messageService.stopHubConnection();
    }
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }
}
