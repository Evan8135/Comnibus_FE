import { Component} from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'delete-account',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  providers: [AuthService],
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.css']
})
export class DeleteAccountComponent {
  reason: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  onDeleteAccount(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.deleteAccount(this.reason).subscribe(
      (response) => {
        this.successMessage = response.message || 'Account successfully deleted.';
        this.logoutAndRedirect();
      },
      (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete account. Please try again later.';
      }
    );
  }

  logoutAndRedirect(): void {
    if (confirm('Are you sure you want to reject this?')) {
      this.authService.removeToken();
      this.router.navigate(['/goodbye']);
    } else {

    }
  }
}
