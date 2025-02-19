import { Component, OnInit } from '@angular/core';
import { WebService } from '../../web.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'requests',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  providers: [WebService],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  requests: any[] = []; // Stores book requests
  isLoading: boolean = true;
  errorMessage: string = '';

  page: number = 1; // Current page number
  pageSize: number = 10; // Number of items per page

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.fetchRequests();
  }

  fetchRequests(): void {
    this.isLoading = true;
    this.webService.getRequests(this.page).subscribe({
      next: (data) => {
        this.requests = data || []; // Ensure data is an array
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching requests:', error);
        this.errorMessage = 'Failed to load requests.';
        this.isLoading = false;
      }
    });
  }

  // Function to go to the next page
  nextPage(): void {
    this.page++;
    this.fetchRequests();
  }

  // Function to go to the previous page
  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchRequests();
    }
  }
}
