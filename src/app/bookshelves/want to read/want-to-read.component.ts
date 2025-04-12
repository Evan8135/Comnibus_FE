import { Component, OnInit } from '@angular/core';
import { WebService } from '../../web.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'want-to-read',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  providers: [WebService, AuthService],
  templateUrl: './want-to-read.component.html',
  styleUrls: ['./want-to-read.component.css']
})
export class TBRBooksComponent implements OnInit {
  TBRBooks: any[] = [];
  token: string | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(private webService: WebService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('x-access-token');
    if (this.token) {
      this.fetchTBRBooks();
    } else {
      this.errorMessage = 'User not logged in or token is invalid.';
      this.loading = false;
    }
  }

  fetchTBRBooks() {
    this.webService.getTBRBooks().subscribe(
      (response) => {
        this.TBRBooks = response.want_to_read;
        this.loading = false;
      },
      (error) => {
        this.errorMessage = 'Error fetching TBR books.';
        this.loading = false;
      }
    );
  }

  removeTBRBook(bookId: string) {
    this.webService.removeBookFromTBR(bookId).subscribe(
      () => {
        this.fetchTBRBooks();
      },
      (error) => {
        this.errorMessage = 'Error removing book from TBR list.';
      }
    );
  }
}
