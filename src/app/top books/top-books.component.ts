import { Component } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'top-books',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  providers: [WebService],
  templateUrl: './top-books.component.html',
  styleUrls: ['./top-books.component.css']
})
export class TopBooksComponent {
  book_list: any;
  page: number = 1;
  titleFilter: string = '';
  selectedTitle: string = '';
  authorFilter: string = '';
  selectedAuthor: string = '';
  genreFilter: string = '';
  selectedGenre: string = '';
  characterFilter: string = '';
  selectedCharacter: string = '';

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['character']) {
        this.characterFilter = params['character'];
        this.selectedCharacter = params['character'];
      }
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


  fetchBooks() {
    const titleFilterLower = this.titleFilter.toLowerCase();
    const authorFilterLower = this.authorFilter.toLowerCase();
    const genreFilterLower = this.genreFilter.toLowerCase();
    const characterFilterLower = this.characterFilter.toLowerCase();

    this.webService
      .getTopBooks(this.page, titleFilterLower, authorFilterLower, genreFilterLower, characterFilterLower)
      .subscribe((response) => {
        this.book_list = response;
      });
  }

  isNSFW(book: any): boolean {
    const nsfwGenres = ['erotic', 'erotica'];
    return book.genres.some((genre: string) => nsfwGenres.includes(genre.toLowerCase()));
  }




  applyFilters() {
    this.page = 1;
    this.router.navigate(['/top-books'], { queryParams: { title: this.titleFilter, genre: this.genreFilter, author: this.authorFilter, character: this.characterFilter } });
    this.fetchBooks();
  }




  clearGenreFilter(): void {
    this.genreFilter = '';
    this.selectedGenre = '';
    this.page = 1; // Reset to the first page when clearing the filter
    this.fetchBooks();
  }

  clearAuthorFilter(): void {
    this.authorFilter = '';
    this.selectedAuthor = '';
    this.page = 1;
    this.fetchBooks();
  }

  clearCharacterFilter(): void {
    this.characterFilter = '';
    this.selectedCharacter = '';
    this.page = 1;
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
