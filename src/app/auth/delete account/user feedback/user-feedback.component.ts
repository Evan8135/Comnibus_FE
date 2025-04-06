import { Component, OnInit } from '@angular/core';
import { WebService } from '../../../web.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'user-feedback',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  providers: [WebService],
  templateUrl: './user-feedback.component.html',
  styleUrls: ['./user-feedback.component.css']
})
export class UserFeedbackComponent implements OnInit {
  user_feedback: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.fetchUserFeedback();
  }

  fetchUserFeedback(): void {
    this.isLoading = true;
    this.webService.getAllFeedback().subscribe({
      next: (data) => {
        this.user_feedback = data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching user-feedback:', error);
        this.errorMessage = 'Failed to load user-feedback.';
        this.isLoading = false;
      }
    });
  }

}
