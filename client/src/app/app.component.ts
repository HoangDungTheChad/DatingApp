import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Dating App';
  users: any;  

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getUsers(); 
  }

  getUsers() {
    this.http.get("https://localhost:5004/api/users").subscribe(response => {
      this.users = response
    }, error => {
      console.log(error)
    })
  }
}
