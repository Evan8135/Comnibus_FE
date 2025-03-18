import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'thoughts',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ReactiveFormsModule],
  providers: [WebService, AuthService],
  templateUrl: './thoughts.component.html',
  styleUrls: ['./thoughts.component.css']
})

export class ThoughtsComponent implements OnInit {
  loading = true;
  page: number = 1;
  thoughts: any[] = [];
  thoughtForm: any;
  showThoughtForm: boolean = false;
  loggedInUserName: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;  // Define isLoading
  submissionMessage: string = ''; // Define submissionMessage

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webService: WebService,
    public authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.loggedInUserName = this.authService.getLoggedInName();
  }

  ngOnInit() {
    console.log("Logged in username: ", this.loggedInUserName);
    this.thoughtForm = this.formBuilder.group({
      username: [{ value: this.loggedInUserName, disabled: true }, Validators.required],
      comment: ['', [Validators.required, Validators.minLength(10)]], // Adjusted length
    });

    if (sessionStorage['page']) {
      this.page = Number(sessionStorage['page']);
    }

    this.webService.getThoughts()
      .subscribe((response: any) => {
        this.thoughts = response;
        this.loading = false;
      });
  }

  handleWritethoughtClick() {
    if (this.authService.isLoggedIn()) {
      this.showThoughtForm = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (this.thoughtForm.invalid) {
      this.submissionMessage = 'Please fill all required fields!';
      return;
    }

    this.isLoading = true;

    // Assuming the authors or other required fields might be there
    const thought = {
      ...this.thoughtForm.value,
    };

    this.webService.postThought(this.page, thought).subscribe(
      (response) => {
        this.isLoading = false;
        this.submissionMessage = response.message;
        // Optionally clear the form or update thoughts
      },
      (error) => {
        this.isLoading = false;
        this.submissionMessage = 'Something went wrong, please try again later.';
      }
    );
  }

  toggleThoughtForm() {
    this.showThoughtForm = !this.showThoughtForm; // Toggle the visibility
  }

  trackThought(index: number, thought: any): string {
    return thought._id;
  }

  isInvalid(control: any) {
    return this.thoughtForm.controls[control].invalid &&
      this.thoughtForm.controls[control].touched;
  }

  isUntouched() {
    return this.thoughtForm.controls.comment.pristine;
  }

  isIncomplete() {
    return this.isInvalid('username') ||
      this.isInvalid('comment') ||
      this.isUntouched();
  }

  like(thought: any) {
    if (thought._id) {  // Use thought._id instead of bookId
      if (this.authService.isLoggedIn()) {
        this.webService.likeThought(thought._id)
          .subscribe((response) => {
            thought.likes = response.likes;  // Adjust according to your API's response
            this.fetchThoughts();
          });
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  dislike(thought: any) {
    if (thought._id) {  // Use thought._id instead of bookId
      if (this.authService.isLoggedIn()) {
        this.webService.dislikeThought(thought._id)
          .subscribe((response) => {
            thought.dislikes = response.dislikes;
            this.fetchThoughts();
          });
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  fetchThoughts() {
    this.webService.getThoughts().subscribe((response: any) => {
      this.thoughts = response;
    });
  }

  deleteThought(thought: any) {
    if (this.authService.isLoggedIn()) {
      if (this.authService.isAdmin() || thought.username === this.loggedInUserName) {
        this.webService.deleteThought(thought._id).subscribe(
          response => {
            // Handle successful deletion
            this.thoughts = this.thoughts.filter(r => r._id !== thought._id);
          },
          error => {
            console.error("Error deleting thought: ", error);
            alert("Failed to delete the thought.");
          }
        );
      } else {
        alert("You are not authorized to delete this thought.");
      }
    } else {
      this.router.navigate(['/login']);
    }
  }
}
