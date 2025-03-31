import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
/**
 * logging in registered users
 */
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * requires username and password
   */
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   *
   * @param control
   * @returns check if any data in the login is invalid
   */
  isInvalid(control: string): boolean {
    return this.loginForm.controls[control].invalid && this.loginForm.controls[control].touched;
  }

  /**
   * check if any data in login is incomplete */
  isIncomplete(): boolean {
    return this.isInvalid('username') || this.isInvalid('password');
  }

  /**
   * submits to login the user
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (response: any) => {
          this.authService.setToken(response.token);
          window.location.reload();
          this.router.navigate(['']);
        },
        error: (error: any) => {
          console.error('Error:', error);
        // Handle error: check for specific error messages from backend
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;  // Assign the error message from backend
          } else {
            this.errorMessage = 'An unexpected error occurred.';
          }
          }
      });

    }
  }
}
