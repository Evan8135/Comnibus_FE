import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
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
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  providers: [WebService, AuthService],
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  book: any;
  user: any;
  rateForm: any;
  showRateForm: boolean = false;
  Same_Author_Books: any[] = [];
  triggers: any;
  triggerForm: any;
  showTriggerForm: boolean = false;
  reviews: any[] = [];
  topReviews: any[] = [];
  isMarkedAsRead: boolean = false;
  userBookRating: any;
  isAddedToTBR: boolean = false;
  isCurrentlyReading: boolean = false;
  isFavouriteBook: boolean = false;
  errorMessage: string | null = null;
  previewUrl: string | null = null;
  isUploading: boolean = false;

  editBookFormTitle: any;
  editBookFormDescription: any;
  editBookFormGenres: any;
  editBookFormPublishDate: any;
  editBookFormCoverImg: any;

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

    if (this.authService.isLoggedIn()) {
      this.webService.getProfile().subscribe(user => {
        this.user = user;
        if (!this.user || !this.user.have_read) {
          console.log('User or have_read not available');
          return;
        }

        console.log('User Have Read Books:', this.user.have_read);
        console.log('User Current Reads:', this.user.currently_reading);
        console.log('User TBR Books:', this.user.want_to_read);
        console.log('User Favourite Books:', this.user.favourite_books);

        this.triggerForm = this.formBuilder.group({
          triggers: ['', Validators.required]
        });

        this.webService.getBook(bookId).subscribe((response: any) => {
          this.book = response.book;
          const userReadBook = this.user.have_read?.find((book: { _id: string; stars: number }) => book._id === this.book._id);
          const userCurrentRead = this.user.currently_reading?.find((book: { _id: string }) => book._id === this.book._id);
          const userTBRBook = this.user.want_to_read?.find((book: { _id: string }) => book._id === this.book._id);
          const userFavourite = this.user.favourite_books?.find((book: { _id: string }) => book._id === this.book._id);

          if (userReadBook) {
            this.userBookRating = userReadBook.stars;
            this.isMarkedAsRead = true;
            console.log('User Rating:', this.userBookRating)
          } else {
            this.userBookRating = null;
          }

          if (userCurrentRead) {
            this.isCurrentlyReading = true;
          }

          if (userTBRBook) {
            this.isAddedToTBR = true;
          }

          if (userFavourite){
            this.isFavouriteBook = true;
          }

          console.log(this.book)

          const authorName = this.book.author[0];
          this.Same_Author_Books = response.same_author_books.filter((book: any) => book.author && book.author[0] === authorName);
        });

        this.rateForm = this.formBuilder.group({
          stars: [5, [Validators.required, Validators.min(0.5), Validators.max(5)]],
          date_read: ["", Validators.required]
        });

        this.webService.getReviews(bookId).subscribe((response) => {
          this.reviews = response;

          this.topReviews = [...this.reviews]
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 3);
        });
      });

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
      this.webService.getReviews(bookId).subscribe((response) => {
           this.reviews = response;

           this.topReviews = [...this.reviews]
             .sort((a, b) => b.likes - a.likes)
             .slice(0, 3);
         });

    }
  }

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

  onSaveTitle() {
    if (this.editBookFormTitle.invalid) return;

    const newTitle = this.editBookFormTitle.value.title;

    this.webService.updateBook(this.book._id, { title: newTitle }).subscribe(
      (response) => {
         alert('Title updated successfully!');
         this.book.title = newTitle;
      },
      (error) => {
         if (error.status === 403) {
            alert('You are not authorized to edit this book.');
         } else {
            alert('Failed to update title.');
         }
         console.error(error);
      }
    );


    this.isEditingTitle = false;
  }


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
        this.book.coverImg = newCoverImg;
      },
      (error) => {
        alert('Failed to update cover image.');
        console.error(error);
      }
    );
    this.isEditingCoverImg = false;
  }


  trackBook(index: number, book: any): string {
    return book._id;
  }

  getStarCountRating(stars: number): any[] {
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];
  }



  getStarCountReviews(stars: number): any[] {
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];
  }






  toggleRateForm() {
    this.showRateForm = !this.showRateForm;
  }

  currentlyReading() {
    const bookId = this.book._id;
    this.webService.addToCurrentReads(bookId).subscribe(
      (response: any) => {
        alert(response.message);
        this.isCurrentlyReading = true;
      },
      (error) => {
        alert("Error adding book to TBR: " + error.error.error);
      }
    );
  }

  removeFromCurrentReads(bookId: string) {
    this.webService.removeFromCurrentReads(bookId).subscribe(
      (response: any) => {
        alert(response.message);
        this.isCurrentlyReading = false;
      }
    );
  }

  markAsRead() {
    const ratingControl = this.rateForm.get('stars');
    const dateControl = this.rateForm.get('date_read');

    ratingControl?.markAsTouched();
    dateControl?.markAsTouched();
    ratingControl?.updateValueAndValidity();
    dateControl?.updateValueAndValidity();

    const rating = ratingControl?.value;
    const dateRead = dateControl?.value;

    console.log("Rating value before submission: ", rating);
    console.log("Date read: ", dateRead);

    if (rating === null || rating < 0 || rating > 5) {
      alert("Please provide a rating between 0 and 5.");
      return;
    }

    const confirmSubmission = confirm(`You are about to submit a rating of ${rating} stars. Do you want to proceed?`);

    if (!confirmSubmission) {
      return;
    }

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
        this.isFavouriteBook = true;
      },
      (error) => {
        alert("Error adding book to TBR: " + error.error.error);
      }
    );
  }

  removeFromFavourite(bookId: string) {
    this.webService.removeFromFavourites(bookId).subscribe(
      (response: any) => {
        alert(response.message);
        this.isFavouriteBook = false;
      }
    );
  }




  filterByGenre(genre: string): void {
    this.router.navigate(['/books'], { queryParams: { genre: genre } });
  }

  filterByAuthor(author: string): void {
    this.router.navigate(['/books'], { queryParams: { author: author } });
  }

  filterByCharacter(character: string): void {
    this.router.navigate(['/books'], { queryParams: { character: character } });
  }

  addTriggers(): void {
    if (this.triggerForm.invalid) {
      return;
    }

    const newTriggers = this.triggerForm.value.triggers.split(',').map((trigger: string) => trigger.trim());

    const updatedTriggers = [...new Set([...this.book.triggers, ...newTriggers])];

    console.log('Updated triggers:', updatedTriggers);

    this.webService.UpdateTriggers(this.book._id, updatedTriggers).subscribe(
      (response) => {
        this.book.triggers = updatedTriggers;
        this.showTriggerForm = false;
        this.triggerForm.reset();
        alert('Triggers updated successfully!');
      },
      (error) => {
        console.error('Error adding trigger warnings:', error);
      }
    );
}

fetchBookDetails(): void {
    this.webService.getBook(this.book._id).subscribe(
      (book) => {
        this.book = book;
        console.log('Updated book data:', this.book);
      },
      (error) => {
        console.error('Error fetching book details:', error);
      }
    );
  }


  like(review: any) {
    if (this.book._id) {
      this.webService.likeReview(this.book._id, review)
        .subscribe((response) => {
          review.likes = response.likes;
        });
    }
  }

  dislike(review: any) {
    if (this.book._id) {
      this.webService.dislikeReview(this.book._id, review)
        .subscribe((response) => {
          review.dislikes = response.dislikes;
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
              alert('Book deleted successfully!');
              this.router.navigate(['/books']);
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
