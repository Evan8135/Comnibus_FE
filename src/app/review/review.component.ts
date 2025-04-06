import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'review',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  providers: [WebService, AuthService],
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  reviews: any[] = [];
  user: any;
  newReplyContent: string = '';
  showReplyForm: boolean = false;
  loggedInUserName: string = '';
  errorMessage: string = '';
  replies: any;
  topReplies: any[] = [];

  showReportReviewForm: boolean = false;
  reportReason: string = '';
  reportReviewId: any = '';
  showReportReplyForm: boolean = false;
  reportReplyId: any = '';
  replyCount: number = 0;

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
          this.reviews = [response];
          this.replyCount = response.replies?.length || 0;
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
           console.log(response.message);
           this.newReplyContent = '';
           this.fetchReplies(review.book_id, review._id);
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
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];
  }

  like(review: any) {
    this.webService.likeReview(review.book_id, review).subscribe((response) => {
      review.likes = response.likes;
    },
    (error) => {
      console.error('Error:', error);
      if (error.error && error.error.message) {
        this.errorMessage = error.error.message;
      } else {
        this.errorMessage = 'An unexpected error occurred.';
      }
      });
  }

  dislike(review: any) {
    this.webService.dislikeReview(review.book_id, review).subscribe((response) => {
      review.dislikes = response.dislikes;
    });
  }

  likeReply(review: any, reply: any) {
    this.webService.likeReviewReply(review._id, reply).subscribe(
      (response) => {
        reply.likes += 1;
        console.log('Reply liked successfully:', response);
      },
      (error) => {
        console.error('Error:', error);
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
        }
    );
  }

  dislikeReply(review: any) {
    this.webService.dislikeReview(review.book_id, review).subscribe((response) => {
      review.dislikes = response.dislikes;
    });
  }

   isInvalid(control: any) {
     return this.newReplyContent.trim() === '';
   }

  trackReview(index: number, review: any): any {
    return review._id;
  }

  deleteReview(review: any) {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isAdmin() || review.username === this.loggedInUserName) {
        this.webService.deleteReview(review.book_id, review).subscribe(
          response => {
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

  reportReview(reviewId: any) {
    if (this.reportReason.trim()) {
      this.webService.reportReview(reviewId, this.reportReason).subscribe(
        (response: any) => {
          console.log("Review reported:", response);
          this.showReportReviewForm = false;
          this.reportReason = '';
        },
        (error) => {
          console.error("Error reporting review:", error);
          this.errorMessage = 'Failed to report review.';
        }
      );
    } else {
      this.errorMessage = 'Please provide a reason for reporting the review.';
    }
  }

  reportReply(reviewId: any, replyId: any) {
    if (this.reportReason.trim()) {
      this.webService.reportReviewReply(reviewId, replyId, this.reportReason).subscribe(
        (response: any) => {
          console.log("Reply reported:", response);
          this.showReportReplyForm = false;
          this.reportReason = '';
        },
        (error) => {
          console.error("Error reporting reply:", error);
          this.errorMessage = 'Failed to report reply.';
        }
      );
    } else {
      this.errorMessage = 'Please provide a reason for reporting the reply.';
    }
  }

  toggleReportReviewForm(reviewId: any) {
    this.reportReviewId = reviewId;
    this.showReportReviewForm = !this.showReportReviewForm;
    this.reportReason = '';
  }

  toggleReportReplyForm(replyId: any, reviewId: any) {
    this.reportReplyId = replyId;
    this.reportReviewId = reviewId;
    this.showReportReplyForm = !this.showReportReplyForm;
    this.reportReason = '';
  }


}
