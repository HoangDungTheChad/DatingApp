import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { error } from 'console';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = "The Dating App";  
  users: any; 

  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.getUsers(); 
  }
  
  getUsers() {
    this.http.get("https://localhost:5001/api/users").subscribe({
      next: res => {
        this.users = res; 
        console.log(this.users); 
      }, 
      error: error => {
        console.error; 
      }
    })
  }
}
