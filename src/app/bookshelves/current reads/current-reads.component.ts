import { Component, OnInit } from '@angular/core';
import { WebService } from '../../web.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'currently-reading',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  providers: [WebService, AuthService],
  templateUrl: './current-reads.component.html',
  styleUrls: ['./current-reads.component.css']
})
export class CurrentReadsComponent {
  currentReads: any[] = [];
  rateForm: any; // Form for rating a book
  userId: string = '';
  token: string | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(private webService: WebService, private authService: AuthService, private route: ActivatedRoute, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('x-access-token');
    if (this.token) {
      this.fetchCurrentReads();
      this.rateForm = this.formBuilder.group({
        stars: [5, [Validators.required, Validators.min(0.5), Validators.max(5)]],
        date_read: ["", Validators.required]
      });
    } else {
      this.errorMessage = 'User not logged in or token is invalid.';
      this.loading = false;
    }
  }

  getStarCount(stars: number): any[] | null {
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];
  }

  toggleRateForm(book: any) {
    book.showRateForm = !book.showRateForm;
  }

  fetchCurrentReads() {
    this.webService.getCurrentReads().subscribe(
      (response) => {
        this.currentReads = response.currently_reading;
        this.currentReads.forEach(book => {
          book.showRateForm = false;
        });
        this.loading = false;
      },
      (error) => {
        this.errorMessage = 'Error fetching current reads.';
        this.loading = false;
      }
    );
  }

  updateReadingProgress(bookId: string, currentPage: number) {
    this.webService.updateReadingProgress(bookId, currentPage).subscribe(
      (response) => {
        this.fetchCurrentReads();
      },
      (error) => {
        this.errorMessage = 'Error updating reading progress.';
      }
    );
  }

  removeFromCurrentReads(bookId: string) {
    this.webService.removeFromCurrentReads(bookId).subscribe(
      (response) => {
        this.fetchCurrentReads();
      },
      (error) => {
        this.errorMessage = 'Error removing book from current reads.';
      }
    );
  }

  markAsRead(bookId: string) {
    const ratingControl = this.rateForm.get('stars');
    const dateControl = this.rateForm.get('date_read');

    ratingControl?.markAsTouched();
    dateControl?.markAsTouched();
    ratingControl?.updateValueAndValidity();
    dateControl?.updateValueAndValidity();

    const rating = ratingControl?.value;
    const dateRead = dateControl?.value;

    if (rating === null || rating < 0 || rating > 5) {
      alert("Please provide a rating between 0 and 5.");
      return;
    }

    const confirmSubmission = confirm(`You are about to submit a rating of ${rating} stars. Do you want to proceed?`);

    if (!confirmSubmission) {
      return;
    }

    this.webService.markBookAsRead(bookId, rating, dateRead).subscribe(
      (response: any) => {
        alert(response.message);
        this.removeFromCurrentReads(bookId);
      },
      (error) => {
        alert("Error marking book as read: " + error.error.error);
      }
    );
  }
}
