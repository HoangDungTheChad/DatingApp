import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MembersService } from '../../_service/members.service';
import { Member } from '../../_models/member';
import { NgIf } from '@angular/common';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryModule, GalleryItem, ImageItem } from 'ng-gallery';
import { DatePipe } from '@angular/common';
import { TimeagoModule } from 'ngx-timeago';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { Message } from '../../_models/message';
import { MessageService } from '../../_service/message.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [
    NgIf,
    TabsModule,
    GalleryModule,
    DatePipe,
    TimeagoModule,
    MemberMessagesComponent,
  ],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css',
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs', {static: true}) memberTabs: TabsetComponent; // this component is provided by ngx-bootstrap
  member: Member;
  images: GalleryItem[] = [];
  activeTab: TabDirective;
  messages: Message[] = []; 

  constructor(
    private membersService: MembersService,
    private route: ActivatedRoute,  
    private messageService: MessageService 
  ) {}

  ngOnInit(): void {
    // we no longer need loadMember 
    // this.loadMember();
    this.route.data.subscribe({
      next: data => {
        this.member = data.member 
      }
    })
    
    this.route.queryParams.subscribe({
      next: params => {
        params.tab ? this.selectTab(params.tab) : this.selectTab(0); 
      }
    })

    this.getImages(); 
  }

  getImages() {
    // set items array
    for (let photo of this.member.photos) {
      this.images.push(new ImageItem({ src: photo.url, thumb: photo.url }));
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

  loadMessages() {
    this.messageService.getMessageThread(this.member.userName).subscribe({
      next: (res) => {
        this.messages = res;
      },
    });
  }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true; 
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data; // so we have access to information inside that tab

    if (this.activeTab.heading == 'Messages' && this.messages.length === 0) {
      this.loadMessages(); 
    }
  }
}
