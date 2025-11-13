import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageItem } from '../../_helpers/image-item';

@Component({
  selector: 'app-member-gallery',
  standalone: true,           // makes this component standalone
  imports: [CommonModule],    // unlocks *ngFor, *ngIf, etc.
  templateUrl: './member-gallery.component.html',
  styleUrls: ['./member-gallery.component.scss']
})
export class MemberGalleryComponent {
  @Input() images: ImageItem[] = [];

  selectedIndex = 0;

  selectImage(index: number) {
    this.selectedIndex = index;
  }

  next() {
    this.selectedIndex = (this.selectedIndex + 1) % this.images.length;
  }

  prev() {
    this.selectedIndex =
      (this.selectedIndex - 1 + this.images.length) % this.images.length;
  }
}
