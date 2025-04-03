import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  triggerForm: any;
  showTriggerForm: boolean = false;
  reviews: any[] = []; // All reviews for the current book
  topReviews: any[] = []; // Top reviews based on likes
  isMarkedAsRead: boolean = false; // Whether the book is marked as read
  userBookRating: any; // The rating given by the user
  isAddedToTBR: boolean = false; // Whether the book is added to "Want to Read"
  isCurrentlyReading: boolean = false; // Whether the book is in the "Currently Reading" list
  isFavouriteBook: boolean = false; // Whether the book is in the "Favourite Books" list
  errorMessage: string | null = null;
  previewUrl: string | null = null;
  isUploading: boolean = false;

  // Form groups for editing title, description, and genres
  editBookFormTitle: any;
  editBookFormDescription: any;
  editBookFormGenres: any;
  editBookFormPublishDate: any;
  editBookFormCoverImg: any;

  // Flags to toggle edit modes
  isEditingTitle: boolean = false;
  isEditingDescription: boolean = false;
  isEditingGenres: boolean = false;
  isEditingPublishDate: boolean = false;
  isEditingCoverImg: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private webService: WebService,
    public authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');
    this.reviews = [];

    // Initialize forms for title, description, and genres
    this.editBookFormTitle = this.formBuilder.group({
      title: [this.book?.title || '', Validators.required]
    });

    this.editBookFormDescription = this.formBuilder.group({
      description: [this.book?.description || '', Validators.required]
    });

    this.editBookFormGenres = this.formBuilder.group({
      genres: [this.book?.genres || [], Validators.required]
    });

    this.editBookFormCoverImg = this.formBuilder.group({
      coverImg: [this.book?.coverImg || '', Validators.required]
    });

    // Fetch data from WebService
    if (this.authService.isLoggedIn()) {
      this.webService.getProfile().subscribe(user => {
        this.user = user;
        if (!this.user || !this.user.have_read) {
          console.log('User or have_read not available');
          return;
        }

        this.webService.getBook(bookId).subscribe((response: any) => {
          this.book = response.book;
          console.log(this.book)
          const authorName = this.book.author[0];
          this.Same_Author_Books = response.same_author_books.filter((book: any) => book.author && book.author[0] === authorName);
        });

        this.rateForm = this.formBuilder.group({
          stars: [5, [Validators.required, Validators.min(0.5), Validators.max(5)]],
          date_read: ["", Validators.required]
        });


      });
      if (this.book.user_reviews > 1){
        this.webService.getReviews(bookId).subscribe(
          (response) => {
            if (response) {
              this.reviews = response;
              this.topReviews = [...this.reviews].sort((a, b) => b.likes - a.likes).slice(0, 3);
            }
          }
        );
      }

    } else {
      this.webService.getBook(bookId).subscribe((response: any) => {
        this.book = response.book;
        const authorName = this.book.author[0];
        this.Same_Author_Books = response.same_author_books.filter((book: any) => book.author && book.author[0] === authorName);
      });

      this.rateForm = this.formBuilder.group({
        stars: [5, [Validators.required, Validators.min(0), Validators.max(5)]],
        date_read: ['', [Validators.required]]
      });
      if (this.book.user_reviews > 1){
        this.webService.getReviews(bookId).subscribe(
          (response) => {
            if (response) {
              this.reviews = response;
              this.topReviews = [...this.reviews].sort((a, b) => b.likes - a.likes).slice(0, 3);
            }
          }
        );
      }

    }
  }

  // Methods to toggle edit forms
  toggleEditTitle() {
    this.isEditingTitle = !this.isEditingTitle;
  }

  toggleEditDescription() {
    this.isEditingDescription = !this.isEditingDescription;
  }

  toggleEditGenres() {
    this.isEditingGenres = !this.isEditingGenres;
  }

  toggleEditPublishDate() {
    this.isEditingPublishDate = !this.isEditingPublishDate;
  }

  toggleEditCoverImg() {
    this.isEditingCoverImg = !this.isEditingCoverImg;
  }

  // Save the updated title
  onSaveTitle() {
    if (this.editBookFormTitle.invalid) return;

    const newTitle = this.editBookFormTitle.value.title;

    this.webService.updateBook(this.book._id, { title: newTitle }).subscribe(
      (response) => {
        alert('Title updated successfully!');
        this.book.title = newTitle;
      },
      (error) => {
        alert('Failed to update title.');
        console.error(error);
      }
    );

    this.isEditingTitle = false;
  }


  // Save the updated description
  onSaveDescription() {
    if (this.editBookFormDescription.invalid) return;

    const newDescription = this.editBookFormDescription.value.description;

    this.webService.updateBook(this.book._id, { description: newDescription }).subscribe(
      (response) => {
        alert('Description updated successfully!');
        this.book.description = newDescription;
      },
      (error) => {
        alert('Failed to update description.');
        console.error(error);
      }
    );

    this.isEditingDescription = false;
  }

  // Save the updated genres
  // onSaveGenres() {
  //   if (this.editBookFormGenres.invalid) return;
  //   this.book.genres = this.editBookFormGenres.value.genres;
  //   this.isEditingGenres = false;
  // }

  onSavePublishDate() {
    if (this.editBookFormPublishDate.invalid) return;

    const newPublishDate = this.editBookFormPublishDate.value.publishDate;

    this.webService.updateBook(this.book._id, { publishDate: newPublishDate }).subscribe(
      (response) => {
        alert('Date Published updated successfully!');
        this.book.publishDate = newPublishDate;
      },
      (error) => {
        alert('Failed to update publish date.');
        console.error(error);
      }
    );

    this.isEditingPublishDate = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
      this.uploadCoverImg(file);
    };
    reader.readAsDataURL(file);
  }

  uploadCoverImg(image: File) {
    this.isUploading = true;
    const formData = new FormData();
    formData.append('image', image);

    this.http.post<any>('http://localhost:5000/api/v1.0/upload-image', formData).subscribe(
      response => {
        if (response.url) {
          this.editBookFormCoverImg.patchValue({ coverImg: response.url });
          this.previewUrl = response.url;
        } else {
          console.error('Failed to upload image:', response);
        }
        this.isUploading = false;
      },
      error => {
        console.error('Error uploading image:', error);
        this.isUploading = false;
      }
    );
  }

  onSaveCoverImg() {
    if (this.editBookFormCoverImg.invalid) return;
    const newCoverImg = this.editBookFormCoverImg.value.coverImg;

    this.webService.updateBook(this.book._id, { coverImg: newCoverImg }).subscribe(
      (response) => {
        alert('Cover image updated successfully!');
        this.book.coverImg = newCoverImg; // Update the local book data
      },
      (error) => {
        alert('Failed to update cover image.');
        console.error(error);
      }
    );
    this.isEditingCoverImg = false;
  }


  // Track books by their ID for rendering optimizations
  trackBook(index: number, book: any): string {
    return book._id;
  }

  // Method to get the star count for ratings
  getStarCount(rating: number): number[] {
    if (rating === undefined || rating === null || isNaN(rating) || rating < 0 || rating > 5) {
      return []; // Return an empty array if the rating is invalid
    }

    const fullStars = Math.floor(rating);
    const halfStar = (rating - fullStars) >= 0.5 ? 0.5 : 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const starsArray = [];
    for (let i = 0; i < fullStars; i++) {
      starsArray.push(1); // Full star
    }
    if (halfStar) {
      starsArray.push(0.5); // Half star
    }
    for (let i = 0; i < emptyStars; i++) {
      starsArray.push(0); // Empty star
    }

    return starsArray;
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

  addTriggers(): void {
    if (this.triggerForm.invalid) {
      // If the form is invalid, stop the submission and possibly show a message
      return;
    }

    const newTriggers = this.triggerForm.value.triggers.split(',').map((trigger: string) => trigger.trim());

    // Get the current triggers from the book's existing trigger list (if any)
    const existingTriggers = this.book.triggers || [];

    // Combine the existing triggers with the new ones (if not already present)
    const updatedTriggers = [...new Set([...existingTriggers, ...newTriggers])]; // Using Set to avoid duplicates

    // Assuming you have a service method to update the book's triggers
    this.webService.UpdateTriggers(this.book._id, updatedTriggers).subscribe(
      (response) => {
        // If the request is successful, update the book's triggers on the UI
        this.book.triggers = updatedTriggers;
        this.showTriggerForm = false; // Close the form
        this.triggerForm.reset(); // Reset the form
        alert('Trigger warnings added successfully!');
      },
      (error) => {
        // If there's an error, show an error message
        console.error('Error adding trigger warnings:', error);
        alert('Failed to add trigger warnings.');
      }
    );
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

  deleteBook(book: any) {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isAdmin() || book.author == this.user.name) {
        const confirmDeletion = confirm("Are you sure you want to delete this book?");
        if (confirmDeletion) {
          this.webService.deleteBook(book._id).subscribe(
            response => {
              // Handle successful deletion
              alert('Book deleted successfully!');
              this.router.navigate(['/books']);  // Redirect to the books list or another page
            },
            error => {
              console.error("Error deleting book: ", error);
              alert("Failed to delete the book.");
            }
          );
        }
      } else {
        alert("You are not authorized to delete this book.");
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

}
