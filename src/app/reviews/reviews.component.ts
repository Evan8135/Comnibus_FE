import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'reviews',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  providers: [WebService, AuthService],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})

export class ReviewsComponent {
  loading = true;
  bookId: string | null = null;
  book: any;
  reviews: any[] = [];
  reviewForm: any;
  showReviewForm: boolean = false
  loggedInUserName: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webService: WebService,
    public authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.loggedInUserName = this.authService.getLoggedInName();
   }

  handleWriteReviewClick() {
    if (this.authService.isLoggedIn()) {
      this.showReviewForm = true;
    } else {
      this.router.navigate(['/login']);
    }
  }



  ngOnInit() {
    console.log("Logged in username: ", this.loggedInUserName);
    this.reviewForm = this.formBuilder.group({
          username: [{ value: this.loggedInUserName, disabled: true }, Validators.required],
          title: [''],
          comment: ['', [Validators.required, Validators.minLength(1000)]],
          stars: [5, [Validators.required, Validators.min(0.5), Validators.max(5)]]
    });
    this.bookId = this.route.snapshot.paramMap.get('id');
    if (this.bookId) {
      this.webService.getReviews(this.bookId)
        .subscribe((response: any) => {
          this.reviews = response;
          this.loading = false;
        });
    }
  }




  onSubmit() {
    const currentTime = new Date().toISOString();

    const reviewData = {
      ...this.reviewForm.value,
      stars: parseFloat(this.reviewForm.value.stars),
      created_at: currentTime,
      updated_at: currentTime
    };

    this.webService.postReview(
      this.route.snapshot.paramMap.get('id'),
      reviewData
    ).subscribe(
      (response) => {
        console.log(response.message);
        this.reviewForm.reset();
        this.fetchReviews();
      },
      (error) => {
        console.error('Error:', error);
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
      }
    );
  }



  getStarCount(stars: number): any[] {
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];
  }

  toggleReviewForm() {
    this.showReviewForm = !this.showReviewForm;
  }

  trackReview(index: number, review: any): string {
    return review._id;
  }

  isInvalid(control: any) {
    return this.reviewForm.controls[control].invalid &&
    this.reviewForm.controls[control].touched;
  }

  isUntouched() {
    return this.reviewForm.controls.comment.pristine;
  }

  isIncomplete() {
    return this.isInvalid('username') ||
    this.isInvalid('comment') ||
    this.isUntouched();
  }

  fetchReviews() {
    if (this.bookId) {
      this.webService.getReviews(this.bookId).subscribe((response: any) => {
        this.reviews = response;
      });
    }
  }

  deleteReview(review: any) {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isAdmin() || review.username === this.loggedInUserName) {
        this.webService.deleteReview(this.bookId, review).subscribe(
          response => {
            // Handle successful deletion
            this.reviews = this.reviews.filter(r => r._id !== review._id);
          },
          error => {
            console.error("Error deleting review: ", error);
            alert("Failed to delete the review.");
          }
        );
      } else {
        alert("You are not authorized to delete this review.");
      }
    } else {
      this.router.navigate(['/login']);
    }
  }




}
