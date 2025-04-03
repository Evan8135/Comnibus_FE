import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'review',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  providers: [WebService, AuthService],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  reviews: any[] = []; // Array to store multiple reviews
  user: any; // The current user
  newReplyContent: string = ''; // Store the content of the reply
  showReplyForm: boolean = false; // Whether to show the reply form
  loggedInUserName: string = '';
  errorMessage: string = '';
  replies: any; // All replies for the current thought
  topReplies: any[] = [];



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webService: WebService,
    public authService: AuthService
  ) { this.loggedInUserName = this.authService.getLoggedInName(); }

  ngOnInit(): void {
    const reviewId = this.route.snapshot.paramMap.get('id');


    if (reviewId) {
      this.webService.getReview(reviewId).subscribe(
        (response: any) => {
          this.reviews = [response]; // Store as an array
        },
        (error) => {
          console.error('Error fetching review:', error);
          this.errorMessage = 'Failed to load review.';
        }
      );
    } else {
      this.errorMessage = 'Invalid review data.';
    }
  }


   submitReply(review: any) {
     if (this.newReplyContent.trim()) {
       const replyData = {
         username: this.loggedInUserName,
         content: this.newReplyContent
       };

       this.webService.postReviewReply(review.book_id, review._id, replyData).subscribe(
         (response) => {
           console.log(response.message); // Log success message
           this.newReplyContent = ''; // Clear the reply box
           this.fetchReplies(review.book_id, review._id); // Fetch the updated list of replies for this review
         },
         (error) => {
           console.error('Error:', error);
           this.errorMessage = error.error?.message || 'An unexpected error occurred.';
         }
       );
     } else {
       this.errorMessage = 'Reply content cannot be empty!';
     }
   }

   fetchReplies(bookId:string , reviewId: string) {
     this.webService.fetchReviewReplies(bookId, reviewId).subscribe((response: any) => {
       this.replies = response;
       this.topReplies = [...this.replies]
         .sort((a, b) => b.likes - a.likes)
         .slice(0, 3);
     });
   }

   toggleReplyForm() {
     this.showReplyForm = !this.showReplyForm;
   }

  getStarCount(stars: number): any[] {
    const fullStars = Math.floor(stars);  // Get the number of full stars
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;  // Check if there's a half star

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];  // Return full stars and half star if needed
  }

  like(review: any) {
    this.webService.likeReview(review.book_id, review).subscribe((response) => {
      review.likes = response.likes; // Update likes count
    },
    (error) => {
      console.error('Error:', error);
    // Handle error: check for specific error messages from backend
      if (error.error && error.error.message) {
        this.errorMessage = error.error.message;  // Assign the error message from backend
      } else {
        this.errorMessage = 'An unexpected error occurred.';
      }
      });
  }

  dislike(review: any) {
    this.webService.dislikeReview(review.book_id, review).subscribe((response) => {
      review.dislikes = response.dislikes; // Update dislikes count
    });
  }

  likeReply(review: any, reply: any) {
    this.webService.likeReviewReply(review._id, reply).subscribe(
      (response) => {
        // Successfully liked the reply, update the UI with the new like count
        reply.likes += 1;  // Increase the likes count directly
        console.log('Reply liked successfully:', response);
      },
      (error) => {
        console.error('Error:', error);
      // Handle error: check for specific error messages from backend
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;  // Assign the error message from backend
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
        }
    );
  }

  dislikeReply(review: any) {
    this.webService.dislikeReview(review.book_id, review).subscribe((response) => {
      review.dislikes = response.dislikes; // Update dislikes count
    });
  }

   isInvalid(control: any) {
     return this.newReplyContent.trim() === '';
   }

  trackReview(index: number, review: any): any {
    return review._id;  // Assuming each review has a unique _id
  }

  deleteReview(review: any) {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isAdmin() || review.username === this.loggedInUserName) {
        this.webService.deleteReview(review.book_id, review).subscribe(
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


   isIncomplete() {
     return this.isInvalid('content');
   }
}
