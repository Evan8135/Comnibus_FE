import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [WebService, AuthService],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})

export class ReportComponent implements OnInit {
  reports: any;
  isUploading: boolean = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private webService: WebService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.webService.getOneReport(this.route.snapshot.paramMap.get('id'))
      .subscribe((response: any) => {
        this.reports = [response];
      });
  }

  approveReport(report: any) {
    if (confirm('Are you sure you want to approve this?')) {
      this.webService.approveReport(report._id).subscribe({
        next: () => {
          console.log("report deleted successfully.");
          this.router.navigate(['/reports']);
        },
        error: (err) => {
          console.error("Error deleting report:", err);
        }
      });
    } else {
      console.error("No token found, cannot delete report.");
    }
  }

  rejectReport(report: any) {
    if (confirm('Are you sure you want to reject this?')) {
      this.webService.rejectReport(report._id).subscribe({
        next: () => {
          console.log("report deleted successfully.");
          this.router.navigate(['/reports']);
        },
        error: (err) => {
          console.error("Error deleting report:", err);
        }
      });
    } else {
      console.error("No token found, cannot delete report.");
    }
  }

  deleteReport(report: any) {
    const confirmDeletion = confirm("Are you sure you want to delete this book?");
    if (confirmDeletion) {
      this.webService.deleteReport(report._id).subscribe(
        response => {
          alert('Book deleted successfully!');
          this.router.navigate(['/reports']);
        },
        error => {
          console.error("Error deleting book: ", error);
          alert("Failed to delete the book.");
        }
      );
    }
  }
}
