import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'book',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ReactiveFormsModule],
  providers: [WebService, AuthService],
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  book: any; // The current book's details
  rateForm: any;
  showRateForm: boolean = false;
  Same_Author_Books: any[] = []; // Array for same_author books
  reviews: any;
  topReviews: any[] = [];
  isAddedToTBR: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private webService: WebService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');

    // Fetch book data
    this.webService.getBook(bookId)
      .subscribe((response: any) => {
        this.book = response.book;
        const authorName = this.book.author[0];
        this.Same_Author_Books = response.same_author_books.filter((book: any) => book.author && book.author[0] === authorName);
        console.log(this.book, this.Same_Author_Books);
      });

    // Initialize the form
    this.rateForm = this.formBuilder.group({
      stars: [5, [Validators.required, Validators.min(0.5), Validators.max(5)]]  // Default rating and validation
    });

    // Fetch reviews and top reviews
    this.webService.getReviews(this.route.snapshot.paramMap.get('id'))
      .subscribe((response) => {
        this.reviews = response;

        this.topReviews = [...this.reviews]
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 3);
      });
  }


  trackBook(index: number, book: any): string {
    return book._id;
  }

  getStarCount(stars: number): any[] {
    const fullStars = Math.floor(stars);  // Get the number of full stars
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;  // Check if there's a half star

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];  // Return full stars and half star if needed
  }

  toggleRateForm() {
    this.showRateForm = !this.showRateForm;
  }

  markAsRead() {
    const ratingControl = this.rateForm.get('stars');

    // Mark the control as touched to trigger validation
    ratingControl?.markAsTouched();
    ratingControl?.updateValueAndValidity();

    const rating = ratingControl?.value;

    console.log("Rating value before submission: ", rating);

    // Validate the rating value
    if (rating === null || rating < 0 || rating > 5) {
      alert("Please provide a rating between 0 and 5.");
      return;
    }

    // Show a confirmation prompt before submitting
    const confirmSubmission = confirm(`You are about to submit a rating of ${rating} stars. Do you want to proceed?`);

    if (!confirmSubmission) {
      return; // Stop submission if the user cancels
    }

    // Make the API call to mark the book as read
    this.webService.markBookAsRead(this.book._id, rating).subscribe(
      (response: any) => {
        alert(response.message);
        this.book.user_score = response.user_score; // Update UI with new score if available
      },
      (error) => {
        alert("Error marking book as read: " + error.error.error);
      }
    );
  }







  // Add to "Want to Read" list (TBR)
  addToTBR() {
    const bookId = this.book._id;
    this.webService.addToWantToRead(bookId).subscribe(
      (response: any) => {
        alert(response.message);
        this.isAddedToTBR = true;  // Update the status to indicate the book is added to TBR
      },
      (error) => {
        alert("Error adding book to TBR: " + error.error.error);
      }
    );
  }

  // Filter books by genre
  filterByGenre(genre: string): void {
    this.router.navigate(['/books'], { queryParams: { genre: genre } });
  }

  // Filter books by author
  filterByAuthor(author: string): void {
    this.router.navigate(['/books'], { queryParams: { author: author } });
  }

  // Like a review
  like(review: any) {
    if (this.book._id) {
      this.webService.likeReview(this.book._id, review)
        .subscribe((response) => {
          // Update review data after liking
          review.likes = response.likes;  // Adjust according to your API's response
        });
    }
  }

  // Dislike a review
  dislike(review: any) {
    if (this.book._id) {
      this.webService.dislikeReview(this.book._id, review)
        .subscribe((response) => {
          // Update review data after disliking
          review.dislikes = response.dislikes;  // Adjust according to your API's response
        });
    }
  }
}
