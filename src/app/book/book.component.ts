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
  user: any; // The current user
  rateForm: any; // Form for rating a book
  showRateForm: boolean = false; // Whether to show the rating form
  Same_Author_Books: any[] = []; // Array for same author books
  triggers: any;
  reviews: any; // All reviews for the current book
  topReviews: any[] = []; // Top reviews based on likes
  isMarkedAsRead: boolean = false; // Whether the book is marked as read
  userBookRating: any; // The rating given by the user
  isAddedToTBR: boolean = false; // Whether the book is added to "Want to Read"
  isCurrentlyReading: boolean = false; // Whether the book is in the "Currently Reading" list
  isFavouriteBook: boolean = false; // Whether the book is in the "Favourite Books" list

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private webService: WebService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    // Fetch the current book ID from the route
    const bookId = this.route.snapshot.paramMap.get('id');

    // Check if the user is logged in
    if (this.authService.isLoggedIn()) {
      this.webService.getProfile().subscribe(user => {
        this.user = user;

        // If user data and have_read are available, continue to process
        if (!this.user || !this.user.have_read) {
          console.log('User or have_read not available');
          return;
        }

        console.log('User Have Read Books:', this.user.have_read);

        // Fetch the current book details
        this.webService.getBook(bookId).subscribe((response: any) => {
          this.book = response.book;

          // Check if the book is in the 'have_read' array
          const userReadBook = this.user.have_read?.find((book: { _id: string; stars: number }) => book._id === this.book._id);

          // If the book is found in 'have_read', set the user rating
          if (userReadBook) {
            this.userBookRating = userReadBook.stars;
            this.isMarkedAsRead = true;
            console.log('User Rating:', this.userBookRating);
          } else {
            this.userBookRating = null;  // If the user hasn't rated this book
          }

          // Handle the logic for same author books
          const authorName = this.book.author[0];
          this.Same_Author_Books = response.same_author_books.filter((book: any) => book.author && book.author[0] === authorName);
        });

        // Initialize the form for rating
        this.rateForm = this.formBuilder.group({
          stars: [5, [Validators.required, Validators.min(0.5), Validators.max(5)]],
          date_read: ["", Validators.required]
        });

        // Fetch reviews and top reviews
        this.webService.getReviews(bookId).subscribe((response) => {
          this.reviews = response;

          // Sort reviews based on likes and take the top 3
          this.topReviews = [...this.reviews]
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 3);
        });

      });
    } else {
      // If not logged in, skip profile-related logic, and only fetch book details
      this.webService.getBook(bookId).subscribe((response: any) => {
        this.book = response.book;

        // Handle the logic for same author books
        const authorName = this.book.author[0];
        this.Same_Author_Books = response.same_author_books.filter((book: any) => book.author && book.author[0] === authorName);
      });

      // Initialize the form for rating (disabled for non-users)
      this.rateForm = this.formBuilder.group({
        stars: [5, [Validators.required, Validators.min(0.5), Validators.max(5)]],
        date_read: ['', [Validators.required]]
      });

      // Fetch reviews and top reviews (non-users can also view reviews)
      this.webService.getReviews(bookId).subscribe((response) => {
        this.reviews = response;

        // Sort reviews based on likes and take the top 3
        this.topReviews = [...this.reviews]
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 3);
      });
    }
  }



  // Track books by their ID for rendering optimizations
  trackBook(index: number, book: any): string {
    return book._id;
  }

  // Method to get the star count for ratings
  getStarCount(stars: number): any[] | null {


    // If the user is logged in, return the normal full and half stars for interaction
    const fullStars = Math.floor(stars);  // Get the number of full stars
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;  // Check if there's a half star

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];  // Return full stars and half star if needed
  }





  // Toggle the visibility of the rate form
  toggleRateForm() {
    this.showRateForm = !this.showRateForm;
  }

  // Method to mark a book as currently reading
  currentlyReading() {
    const bookId = this.book._id;
    this.webService.addToCurrentReads(bookId).subscribe(
      (response: any) => {
        alert(response.message);
        this.isCurrentlyReading = true;  // Update the status to indicate the book is added to TBR
      },
      (error) => {
        alert("Error adding book to TBR: " + error.error.error);
      }
    );
  }

  // Remove the book from the "Currently Reading" list
  removeFromCurrentReads(bookId: string) {
    this.webService.removeFromCurrentReads(bookId).subscribe(
      (response: any) => {
        alert(response.message);
        this.isCurrentlyReading = false;
      }
    );
  }

  // Method to mark a book as read and submit rating
  markAsRead() {
    const ratingControl = this.rateForm.get('stars');
    const dateControl = this.rateForm.get('date_read');

    // Mark the control as touched to trigger validation
    ratingControl?.markAsTouched();
    dateControl?.markAsTouched();
    ratingControl?.updateValueAndValidity();
    dateControl?.updateValueAndValidity();

    const rating = ratingControl?.value;
    const dateRead = dateControl?.value;

    console.log("Rating value before submission: ", rating);
    console.log("Date read: ", dateRead);

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
    this.webService.markBookAsRead(this.book._id, rating, dateRead).subscribe(
      (response: any) => {
        alert(response.message);
        this.isMarkedAsRead = true;
      },
      (error) => {
        alert("Error marking book as read: " + error.error.error);
      }
    );
  }

  removeFromMarkAsRead(bookId: string) {
    this.webService.removeBookFromRead(bookId).subscribe(
      (response: any) => {
        alert(response.message);
        this.isMarkedAsRead = false;
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

  // Remove from "Want to Read" list (TBR)
  removeFromTBR(bookId: string) {
    this.webService.removeBookFromTBR(bookId).subscribe(
      (response: any) => {
        alert(response.message);
        this.isAddedToTBR = false;
      }
    );
  }

  markAsFavourite() {
    const bookId = this.book._id;
    this.webService.addToFavourites(bookId).subscribe(
      (response: any) => {
        alert(response.message);
        this.isFavouriteBook = true;  // Update the status to indicate the book is added to TBR
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

  filterByCharacter(character: string): void {
    this.router.navigate(['/books'], { queryParams: { character: character } });
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
