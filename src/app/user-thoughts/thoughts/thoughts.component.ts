import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../../web.service';
import { AuthService } from '../../auth/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'thoughts',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
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
  isLoading: boolean = false;
  submissionMessage: string = '';


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
      comment: ['', [Validators.required]],
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
    const currentTime = new Date().toISOString();

    if (this.thoughtForm.invalid) {
      this.submissionMessage = 'Please fill all required fields!';
      return;
    }

    this.isLoading = true;


    const thought = {
      ...this.thoughtForm.value,
      created_at: currentTime
    };

    console.log("Thought being submitted:", thought);

    this.webService.postThought(thought, this.page).subscribe(
      (response) => {
        this.isLoading = false;
        this.submissionMessage = response.message;
        this.thoughtForm.reset();
        this.fetchThoughts();

      },
      (error) => {
        this.isLoading = false;
        this.submissionMessage = 'Something went wrong, please try again later.';
      }
    );
  }

  toggleThoughtForm() {
    this.showThoughtForm = !this.showThoughtForm;
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
    if (thought._id) {
      if (this.authService.isLoggedIn()) {
        this.webService.likeThought(thought._id)
          .subscribe((response) => {
            thought.likes = response.likes;
            this.fetchThoughts();
          });
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  dislike(thought: any) {
    if (thought._id) {
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
