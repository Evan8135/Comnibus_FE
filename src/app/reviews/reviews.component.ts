import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'reviews',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ReactiveFormsModule],
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public webService: WebService,
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
          title: ['', Validators.required],
          comment: ['', Validators.required],
          stars: 5
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
    this.webService.postReview(
      this.route.snapshot.paramMap.get('id'),
      this.reviewForm.value)
      .subscribe((response) => {
        this.reviewForm.reset();
        this.fetchReviews();
      });
      this.webService.getReviews(this.route.snapshot.paramMap.get('id'))
      .subscribe((response: any) => {
        this.reviews = response;
      });
  }

  getStarCount(stars: number): any[] {
    const fullStars = Math.floor(stars);  // Get the number of full stars
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;  // Check if there's a half star

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];  // Return full stars and half star if needed
  }

  toggleReviewForm() {
    this.showReviewForm = !this.showReviewForm; // Toggle the visibility
  }

  trackReview(index: number, review: any): string {
    return review._id;
  }

  isInvalid(control: any) {
    return this.reviewForm.controls[control].invalid &&
    this.reviewForm.controls[control].touched;
  }

  isUntouched() {
    return this.reviewForm.controls.title.pristine ||
    this.reviewForm.controls.comment.pristine;
  }

  isIncomplete() {
    return this.isInvalid('username') ||
    this.isInvalid('title') ||
    this.isInvalid('comment') ||
    this.isUntouched();
  }

  like(review: any) {
    if (this.bookId) {
      if (this.authService.isLoggedIn()) {
        this.webService.likeReview(this.bookId, review)
          .subscribe((response) => {
            // Optionally update review data after liking
            review.likes = response.likes;  // Adjust according to your API's response
            this.fetchReviews();
          });
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  // Method to handle disliking a review
  dislike(review: any) {
    if (this.bookId) {
      if (this.authService.isLoggedIn()) {
        this.webService.dislikeReview(this.bookId, review)
          .subscribe((response) => {
            // Optionally update review data after disliking
            review.dislikes = response.dislikes;
            this.fetchReviews();
          });
      } else {
        this.router.navigate(['/login']);
      }
    }
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
