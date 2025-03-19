import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../../web.service';
import { AuthService } from '../../auth/auth.service';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'thought',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  providers: [WebService, AuthService],
  templateUrl: './thought.component.html',
  styleUrls: ['./thought.component.css']
})
export class ThoughtComponent implements OnInit {
  thoughts: any[] = []; // Array to store multiple thoughts
  user: any; // The current user
  newReplyContent: string = ''; // Store the content of the reply
  showReplyForm: boolean = false; // Whether to show the reply form
  loggedInUserName: string = '';
  errorMessage: string = '';

  replies: any; // All replies for the current thought
  topReplies: any[] = []; // Top replies based on likes

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
          console.log(response.message); // Log success message
          this.newReplyContent = ''; // Clear the reply box
          this.fetchReplies(thoughtId); // Fetch the updated list of replies for this thought
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

  fetchReplies(thoughtId: string) {
    this.webService.fetchReplies(thoughtId).subscribe((response: any) => {
      this.replies = response;
      this.topReplies = [...this.replies]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3);
    });
  }

  toggleReplyForm() {
    this.showReplyForm = !this.showReplyForm;
  }

  like(reply: any) {
    this.webService.likeReply(reply.thoughtId, reply).subscribe((response) => {
      reply.likes = response.likes; // Update likes count
    });
  }

  dislike(reply: any) {
    this.webService.dislikeReply(reply.thoughtId, reply).subscribe((response) => {
      reply.dislikes = response.dislikes; // Update dislikes count
    });
  }

  isInvalid(control: any) {
    return this.newReplyContent.trim() === '';
  }

  trackThought(index: number, thought: any): any {
    return thought._id;  // Assuming each thought has a unique _id
  }


  isIncomplete() {
    return this.isInvalid('content');
  }
}
