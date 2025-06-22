import { Component, inject, Input, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { Member } from '../_models/member';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Photo } from '../_models/Photo';
import { MembersService } from '../_service/members.service';
import { User } from '../_models/user';
import { AccountService } from '../_service/account.service';
import { take } from 'rxjs';
import { NgClass } from '@angular/common';

let httpOptions = {
  headers: undefined
}

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, NgClass],
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css'],
})
export class PhotoEditorComponent {
  @Input() member!: Member;
  baseUrl = environment.apiUrl; 
  selectedFiles: File[] = [];
  previews: string[] = [];
  isDragging = false;
  user: User; 

  private platformId = inject(PLATFORM_ID)
  private http = inject(HttpClient); 

  constructor(private memberService: MembersService, private accountService: AccountService) {
    if (isPlatformBrowser(this.platformId)) {
      httpOptions.headers = new HttpHeaders({
        Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user'))?.token
      })
    }

    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        this.user = user; 
      }
    })
  }

  onFilesSelected(files: FileList | null): void {
    if (!files) return;

    Array.from(files).forEach((file) => {
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.previews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  handleFileInput(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    this.onFilesSelected(files);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    this.onFilesSelected(files || null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  onUpload(): void {
    console.log('Uploading for member:', this.member);
    this.selectedFiles.forEach((file) => {
      console.log('File:', file.name);
      // Sending post request to upload the file  
      const formData = new FormData();  
      formData.append('file', file)

      this.http.post(this.baseUrl + 'users/add-photo', formData, httpOptions).subscribe({
        next: (res: Photo) => {
          if (res) {
            const photo = res 
            this.member.photos.push(photo)
            if (photo.isMain) {
              this.user.photoUrl = photo.url;  
              this.member.photoUrl = photo.url;  
              this.accountService.setCurrentUser(this.user); 
              console.log(photo.isMain)
            }
            
            // remove the selected file after upload  
            const index = this.selectedFiles.indexOf(file); 
            if (index > -1) {
              this.selectedFiles.splice(index, 1); 
            }
          }
        }
      })
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previews.splice(index, 1); // in case you want to show previews later
  }

  removeAllFiles(): void {
    this.selectedFiles = [];
    this.previews = [];
  }

  setMainPhoto(photo: Photo) {
    this.memberService.setMainPhoto(photo.id).subscribe({
      next: () => {
        this.user.photoUrl = photo.url;  
        this.accountService.setCurrentUser(this.user);  
        this.member.photoUrl = photo.url; 
        this.member.photos.forEach(p => {
          if (p.isMain) p.isMain = false; 
          if (p.id === photo.id) p.isMain = true; 
        })
      }
    })
  }

  deletePhoto(photoId: number) {
    this.memberService.deletePhoto(photoId).subscribe({
      next: () => {
        this.member.photos = this.member.photos.filter(x => x.id !== photoId); 
      }
    })
  }
}
