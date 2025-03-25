import { Component, OnInit } from '@angular/core';
import { WebService } from '../../web.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'have-read',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, FormsModule, ReactiveFormsModule],
  providers: [WebService, AuthService],
  templateUrl: './read-books.component.html',
  styleUrls: ['./read-books.component.css']
})
export class ReadBooksComponent implements OnInit {
  readBooks: any[] = [];
  editForms: { [key: string]: FormGroup } = {}; // Stores a form for each book
  token: string | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(private webService: WebService, private authService: AuthService, private route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('x-access-token');
    if (this.token) {
      this.fetchReadBooks();
    } else {
      this.errorMessage = 'User not logged in or token is invalid.';
      this.loading = false;
    }
  }

  fetchReadBooks() {
    this.webService.getReadBooks().subscribe(
      (response) => {
        this.readBooks = response.have_read;
        this.readBooks.sort((a, b) => new Date(b.date_read).getTime() - new Date(a.date_read).getTime());

        // Initialize each book with a form
        this.readBooks.forEach(book => {
          this.editForms[book._id] = this.formBuilder.group({
            stars: [book.stars, [Validators.min(0), Validators.max(5)]],
            date_read: [book.date_read]
          });

          book.showEditForm = false; // Initially hide the edit form
        });

        this.loading = false;
      },
      (error) => {
        this.errorMessage = 'Error fetching read books.';
        this.loading = false;
      }
    );
  }

  toggleEditForm(book: any) {
    book.showEditForm = !book.showEditForm; // Toggle form visibility
  }

  submitEditForm(bookId: string) {
    if (!this.editForms[bookId].valid) {
      alert('Please enter valid values.');
      return;
    }

    const updatedData = this.editForms[bookId].value;

    // Only include fields that have changed
    const requestData: any = {};
    if (updatedData.stars !== null && updatedData.stars !== this.readBooks.find(b => b._id === bookId)?.stars) {
      requestData.stars = updatedData.stars;
    }
    if (updatedData.date_read !== this.readBooks.find(b => b._id === bookId)?.date_read) {
      requestData.date_read = updatedData.date_read;
    }

    if (Object.keys(requestData).length === 0) {
      alert('No changes detected.');
      return;
    }

    this.webService.updateReadBook(bookId, requestData).subscribe(
      (response) => {
        alert('Book updated successfully.');
        this.fetchReadBooks(); // Refresh data
      },
      (error) => {
        alert('Error updating book: ' + error.error.error);
      }
    );
  }


  getStarCount(stars: number): any[] | null {
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];
  }

  removeReadBook(bookId: string) {
    this.webService.removeBookFromRead(bookId).subscribe(
      () => {
        this.fetchReadBooks(); // Refresh the list
      },
      (error) => {
        this.errorMessage = 'Error removing book from read list.';
      }
    );
  }
}
