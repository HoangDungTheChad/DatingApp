import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MembersService } from '../../_service/members.service';
import { Member } from '../../_models/member';
import { NgIf } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryModule, GalleryItem, ImageItem} from 'ng-gallery';

@Component({
  selector: 'app-member-detail',
  imports: [NgIf, TabsModule, GalleryModule],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css',
})
export class MemberDetailComponent implements OnInit {
  member: Member;
  images: GalleryItem[];

  constructor(
    private membersService: MembersService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // load member and photo gallery
    this.loadMember();
  }

  getImages() {
    // set items array
    const images = [];
    for (let photo of this.member.photos) {
      images.push(new ImageItem({ src: photo.url, thumb: photo.url }));
    }
    return images;
  }

  loadMember() {
    this.membersService
      .getMember(this.route.snapshot.paramMap.get('username'))
      .subscribe((member) => {
        this.member = member;
        this.images = this.getImages();
      });
  }
}
