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
  requests: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  page: number = 1;
  pageSize: number = 10;

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.fetchRequests();
  }

  fetchRequests(): void {
    this.isLoading = true;
    this.webService.getRequests(this.page).subscribe({
      next: (data) => {
        this.requests = data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching requests:', error);
        this.errorMessage = 'Failed to load requests.';
        this.isLoading = false;
      }
    });
  }

  nextPage(): void {
    this.page++;
    this.fetchRequests();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.fetchRequests();
    }
  }
}
