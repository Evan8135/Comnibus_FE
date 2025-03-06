import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'review',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [WebService, AuthService],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  loading = true;
  bookId: string | null = null;
  reviewId: string | null = null;
  review: any;
  reviewForm: any;
  showReviewForm: boolean = false;
  loggedInUserName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webService: WebService,
    public authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.loggedInUserName = this.authService.getLoggedInName();
  }

  ngOnInit() {
    this.bookId = this.route.snapshot.paramMap.get('id');
    console.log("BOOK ID:", this.bookId)
    this.review = this.route.snapshot.paramMap.get('review');
    console.log("REVIEW ID: ", this.reviewId)

    if (this.bookId && this.reviewId) {
      this.webService.getReview(this.bookId, this.reviewId)
        .subscribe({
          next: (response: any) => {
            this.review = response;
            console.log(this.review)
            this.loading = false;
          },
          error: (error: any) => {
            console.error("Error fetching review:", error);
            this.loading = false;  // Even if an error occurs, stop loading
          }
        });
    } else {
      this.loading = false;
    }
  }





  fetchReview(review: any) {
    if (this.bookId) {
      this.webService.getReview(this.bookId, review).subscribe((response: any) => {
        this.review = response;
      });
    }
  }

  deleteReview() {
    if (this.authService.isLoggedIn() && (this.authService.isAdmin() || this.review.username === this.loggedInUserName)) {
      this.webService.deleteReview(this.bookId, this.review).subscribe(
        () => {
          this.review = null;
        },
        error => {
          console.error("Error deleting review:", error);
          alert("Failed to delete the review.");
        }
      );
    } else {
      alert("You are not authorized to delete this review.");
    }
  }
}
