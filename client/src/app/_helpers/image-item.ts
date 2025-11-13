export class ImageItem {
  url!: string;
  thumbnail_url!: string;

  constructor(url, thumbnail_url) {
    this.url = url;  
    this.thumbnail_url = thumbnail_url; 
  }
}