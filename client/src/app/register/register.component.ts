import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { AccountService } from '../_service/account.service';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    NgFor
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  model: any = {}
  @Output() cancelRegister = new EventEmitter(); 

  constructor(private accountService: AccountService) {}

  register() {
    this.accountService.register(this.model).subscribe({
      next: (res) => {
        console.log(res); 
        this.cancel(); 
      },
      error: (error) => {
        console.log(error); 
      }
    })
  }

  cancel() {
    this.cancelRegister.emit(false); 
  }
}
