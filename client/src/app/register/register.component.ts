import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  MaxLengthValidator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AccountService } from '../_service/account.service';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { DateInputComponent } from '../_forms/date-input/date-input.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    NgFor,
    ReactiveFormsModule,
    NgIf,
    TextInputComponent, 
    DateInputComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  model: any = {};
  @Output() cancelRegister = new EventEmitter();
  registerForm: FormGroup;
  private fb = inject(FormBuilder)
  maxDate: Date; 
  validationErrors: string[] = []; 
  valError: string; 

  constructor(
    private accountService: AccountService,
    private toastr: ToastrService, 
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate = new Date();  
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18)
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'], // radio button 
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(20),
        ],
      ],
      confirmPassword: [
        '',
        [Validators.required, this.matchValues('password')],
      ],
    });
    this.registerForm.controls.password.valueChanges.subscribe({
      next: () => {
        this.registerForm.controls.confirmPassword.updateValueAndValidity();
      },
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.controls[matchTo].value
        ? null
        : { isMatching: true };
    };
  }

  register() {
    console.log(this.registerForm.value);
    this.accountService.register(this.registerForm.value).subscribe({
      next: (res) => {
        console.log(res)
        this.router.navigateByUrl("/members"); 
      },
      error: (error) => {
        this.validationErrors = error 
      },
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
