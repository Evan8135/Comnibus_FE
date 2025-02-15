import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'books',
  standalone: true,
  imports: [RouterOutlet, RouterModule, FormsModule, CommonModule],
  providers: [WebService],
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent {
  book_list: any;
  page: number = 1;
  titleFilter: string = '';
  selectedTitle: string = '';
  authorFilter: string = '';
  selectedAuthor: string = '';
  genreFilter: string = '';
  selectedGenre: string = '';

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Handle query parameters from the URL
    this.route.queryParams.subscribe((params) => {
      if (params['genre']) {
        this.genreFilter = params['genre'];
        this.selectedGenre = params['genre'];
      }
      if (params['author']) {
        this.authorFilter = params['author'];
        this.selectedAuthor = params['author'];
      }
      if (params['title']) {
        this.titleFilter = params['title'];
        this.selectedTitle = params['title'];
      }
      this.fetchBooks();
    });

    if (sessionStorage['page']) {
      this.page = Number(sessionStorage['page']);
    }
    this.fetchBooks();
  }

  /**
   * Fetch books from the web service
   */
  fetchBooks() {
    // Convert filters to lowercase for case-insensitive comparison
    const titleFilterLower = this.titleFilter.toLowerCase();
    const authorFilterLower = this.authorFilter.toLowerCase();
    const genreFilterLower = this.genreFilter.toLowerCase();

    this.webService
      .getBooks(this.page, titleFilterLower, authorFilterLower, genreFilterLower)
      .subscribe((response) => {
        this.book_list = response;
      });
  }


  /**
   * Apply both author and genre filters
   */
  applyFilters() {
    this.page = 1;
    this.router.navigate(['/books'], { queryParams: { title: this.titleFilter, genre: this.genreFilter, author: this.authorFilter } });
    this.fetchBooks();
  }



  /**
   * Clear genre filter
   */
  clearGenreFilter(): void {
    this.genreFilter = '';
    this.selectedGenre = '';
    this.page = 1; // Reset to the first page when clearing the filter
    this.fetchBooks();
  }

  clearAuthorFilter(): void {
    this.authorFilter = '';
    this.selectedAuthor = '';
    this.page = 1; // Reset to the first page when clearing the filter
    this.fetchBooks();
  }

  previousPage() {
    if (this.page > 1) {
      this.page -= 1;
      sessionStorage['page'] = this.page;
      this.fetchBooks();
    }
  }

  nextPage() {
    this.page += 1;
    sessionStorage['page'] = this.page;
    this.fetchBooks();
  }
}
