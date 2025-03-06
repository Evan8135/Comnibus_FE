import { Component, OnInit } from '@angular/core';
import { WebService } from '../../web.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'currently-reading',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, FormsModule],
  providers: [WebService, AuthService],
  templateUrl: './current-reads.component.html',
  styleUrls: ['./current-reads.component.css']
})
export class CurrentReadsComponent {
  currentReads: any[] = [];
  userId: string = '';
  token: string | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(private webService: WebService, private authService: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('x-access-token');
    if (this.token) {
      this.fetchCurrentReads();
    } else {
      this.errorMessage = 'User not logged in or token is invalid.';
      this.loading = false;
    }
  }


  // Fetch books from the "currently reading" list
  fetchCurrentReads() {
    this.webService.getCurrentReads().subscribe(
      (response) => {
        this.currentReads = response.currently_reading;
        this.loading = false;
      },
      (error) => {
        this.errorMessage = 'Error fetching current reads.';
        this.loading = false;
      }
    );
  }

  // Update the reading progress
  updateReadingProgress(bookId: string, currentPage: number) {
    this.webService.updateReadingProgress(bookId, currentPage).subscribe(
      (response) => {
        this.fetchCurrentReads(); // Refresh the list after updating
      },
      (error) => {
        this.errorMessage = 'Error updating reading progress.';
      }
    );
  }

  // Remove book from "currently reading"
  removeFromCurrentReads(bookId: string) {
    this.webService.removeFromCurrentReads(bookId).subscribe(
      (response) => {
        this.fetchCurrentReads(); // Refresh the list after removing
      },
      (error) => {
        this.errorMessage = 'Error removing book from current reads.';
      }
    );
  }
}
