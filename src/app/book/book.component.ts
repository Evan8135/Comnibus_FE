import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'book',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ReactiveFormsModule],
  providers: [WebService],
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  book: any; // The current book's details
  Same_Author_Books: any[] = []; // Array for same_author books
  reviewForm: any;
  reviews: any
  topReviews: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private webService: WebService
  ) { }

  ngOnInit() {
    // Fetch book data based on the ID parameter in the route
    const bookId = this.route.snapshot.paramMap.get('id');

    this.webService.getBook(bookId)
      .subscribe((response: any) => {
        this.book = response.book; // Main book data
        const authorName = this.book.author[0];
        this.Same_Author_Books = response.same_author_books.filter((book: any) => book.author && book.author[0] === authorName);  // List of same_author books
        console.log(this.book, this.Same_Author_Books); // Debugging to ensure data is fetched correctly
      });

    this.reviewForm = this.formBuilder.group({
      name: ['', Validators.required],
      title: ['', Validators.required],
      comment: ['', Validators.required],
      stars: 5
    });
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

  filterByGenre(genre: string): void {
    this.router.navigate(['/books'], { queryParams: { genre: genre } });
  }

  filterByAuthor(author: string): void {
    this.router.navigate(['/books'], { queryParams: { author: author } });
  }

  onSubmit() {
    this.webService.postReview(
      this.route.snapshot.paramMap.get('id'),
      this.reviewForm.value)
      .subscribe((response) => {
        this.reviewForm.reset();
    });
    this.webService.getReviews(this.route.snapshot.paramMap.get('id'))
      .subscribe((response: any) => {
        this.reviews = [response];

        this.topReviews = [...this.reviews]
              .sort((a, b) => b.likes - a.likes)
              .slice(0, 3);
          });
  }

  like(review: any) {
    if (this.book._id) {
      this.webService.likeReview(this.book._id, review)
        .subscribe((response) => {
          // Optionally update review data after liking
          review.likes = response.likes;  // Adjust according to your API's response
        });
    }
  }

  // Method to handle disliking a review
  dislike(review: any) {
    if (this.book._id) {
      this.webService.dislikeReview(this.book._id, review)
        .subscribe((response) => {
          // Optionally update review data after disliking
          review.dislikes = response.dislikes;  // Adjust according to your API's response
        });
    }
  }

}
