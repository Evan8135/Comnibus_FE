import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../../web.service';
import { AuthService } from '../../auth/auth.service';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'thought',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  providers: [WebService, AuthService],
  templateUrl: './thought.component.html',
  styleUrls: ['./thought.component.css']
})
export class ThoughtComponent implements OnInit {
  thoughts: any[] = [];
  user: any;
  newReplyContent: string = '';
  showReplyForm: boolean = false;
  loggedInUserName: string = '';
  errorMessage: string = '';

  replies: any;
  topReplies: any[] = [];
  replyCount: number = 0;

  showReportThoughtForm: boolean = false;
  reportReason: string = '';
  reportThoughtId: any = '';
  showReportReplyForm: boolean = false;
  reportReplyId: any = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webService: WebService,
    public authService: AuthService
  ) { this.loggedInUserName = this.authService.getLoggedInName(); }

  ngOnInit(): void {
    this.webService.getThought(this.route.snapshot.paramMap.get('id'))
      .subscribe((response: any) => {
        this.thoughts = [response];
        this.replyCount = response.replies?.length || 0;
      });


  }

  submitReply(thoughtId: string) {
    if (this.newReplyContent.trim()) {
      const replyData = {
        username: this.loggedInUserName,
        content: this.newReplyContent
      };

      this.webService.postReply(thoughtId, replyData).subscribe(
        (response) => {
          console.log(response.message);
          this.newReplyContent = '';
          this.fetchReplies(thoughtId);
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

  fetchReplies(thought: any) {
    this.webService.fetchReplies(thought._id).subscribe((response: any) => {
      this.replies = response;
      this.topReplies = [...this.replies]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3);
    });
  }

  toggleReplyForm() {
    this.showReplyForm = !this.showReplyForm;
  }

  likeReply(thought: any, reply: any) {
    this.webService.likeReply(thought._id, reply).subscribe((response) => {
      reply.likes = response.likes;
      this.fetchReplies(thought);
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

  likeThought(thought: any) {

    this.webService.likeThought(thought).subscribe((response) => {
      thought.likes = response.likes;
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

  dislike(reply: any) {
    this.webService.dislikeReply(reply.thoughtId, reply).subscribe((response) => {
      reply.dislikes = response.dislikes;
    });
  }

  isInvalid(control: any) {
    return this.newReplyContent.trim() === '';
  }

  trackThought(index: number, thought: any): any {
    return thought._id;
  }


  isIncomplete() {
    return this.isInvalid('content');
  }

  reportThought(thoughtId: any) {
    if (this.reportReason.trim()) {
      this.webService.reportThought(thoughtId, this.reportReason).subscribe(
        (response: any) => {
          console.log("Thought reported:", response);
          this.showReportThoughtForm = false;
          this.reportReason = '';
        },
        (error) => {
          console.error("Error reporting thought:", error);
          this.errorMessage = 'Failed to report thought.';
        }
      );
    } else {
      this.errorMessage = 'Please provide a reason for reporting the thought.';
    }
  }

  reportReply(thoughtId: any, replyId: any) {
    if (this.reportReason.trim()) {
      this.webService.reportThoughtReply(thoughtId, replyId, this.reportReason).subscribe(
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

  toggleReportThoughtForm(thoughtId: any) {
    this.reportThoughtId = thoughtId;
    this.showReportThoughtForm = !this.showReportThoughtForm;
    this.reportReason = '';
  }

  toggleReportReplyForm(replyId: any, thoughtId: any) {
    this.reportReplyId = replyId;
    this.reportThoughtId = thoughtId;
    this.showReportReplyForm = !this.showReportReplyForm;
    this.reportReason = '';
  }
}
