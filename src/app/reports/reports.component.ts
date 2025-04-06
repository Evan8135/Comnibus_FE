import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'reports',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  providers: [WebService],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.fetchReports();
  }

  fetchReports(): void {
    this.isLoading = true;
    this.webService.getAllReports().subscribe({
      next: (data) => {
        this.reports = data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching reports:', error);
        this.errorMessage = 'Failed to load reports.';
        this.isLoading = false;
      }
    });
  }

}
