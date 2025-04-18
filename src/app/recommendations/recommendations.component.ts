import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WebService } from '../web.service';

@Component({
  selector: 'recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css'],
  imports: [RouterModule, CommonModule],
  providers: [WebService],
  standalone: true
})
export class RecommendationsComponent {
  recommendations: any[] = [];
  booksByAuthor: { [author: string]: any[] } = {};
  highRatedAuthorsBooks: any[] = [];
  booksMatchingMultipleGenres: any[] = [];
  haveReadBooksByAuthor: any[] = [];
  additionalBooksByGenres: any[] = [];
  errorMessage: string | null = null;
  page: number = 1;
  pageSize: number = 10;

  favoriteGenres: string[] = [];
  favoriteAuthors: string[] = [];
  haveReadBooks: any[] = [];

  constructor(private webService: WebService) {}

  ngOnInit(): void {
    this.fetchRecommendations();
  }

  fetchRecommendations(): void {
    this.webService.getRecommendations(this.page, this.pageSize).subscribe(
      (data: any) => {
        this.recommendations = data.recommended_books;
        this.favoriteGenres = data.favorite_genres || [];
        this.favoriteAuthors = data.favorite_authors || [];
        this.haveReadBooks = data.have_read || [];

        const authorsOfReadBooks = this.haveReadBooks.flatMap((book: any) => book.author);
        console.log("Authors of read books:", authorsOfReadBooks);

        this.haveReadBooksByAuthor = this.recommendations.filter(book => {
          const authors = Array.isArray(book.author) ? book.author : [book.author];
          return authors.some((author: string) => authorsOfReadBooks.includes(author));
        });

        console.log("Books by authors of 'have read' books:", this.haveReadBooksByAuthor);

        const highlyRatedAuthors: string[] = this.haveReadBooks
          .filter((book: any) => book.stars >= 3.5)
          .flatMap((book: any) => book.author);

        console.log("Highly Rated Authors:", highlyRatedAuthors);

        this.highRatedAuthorsBooks = this.recommendations.filter((book: any) => {
          const authors: string[] = Array.isArray(book.author) ? book.author : [book.author];
          return authors.some((author: string) => highlyRatedAuthors.includes(author));
        });

        console.log("Books from Highly Rated Authors:", this.highRatedAuthorsBooks);

        this.filterRecommendations();
        this.filterBooksByMultipleGenres();
        this.groupBooksByAuthor();
      },
      (error) => {
        this.errorMessage = "Please log in to view recommendations.";
        console.error(error);
      }
    );
  }

  filterRecommendations(): void {
    this.recommendations = this.recommendations.filter(book => {
      const hasFavoriteGenre = this.favoriteGenres.some(genre => book.genres.includes(genre));
      const hasFavoriteAuthor = this.favoriteAuthors.some(author => {
        const authors = Array.isArray(book.author) ? book.author : [book.author];
        return authors.includes(author);
      });
      return hasFavoriteGenre || hasFavoriteAuthor;
    });
  }

  filterBooksByMultipleGenres(): void {
    this.booksMatchingMultipleGenres = this.recommendations.filter(book => {
      const matchingGenres = book.genres.filter((genre: string) => this.favoriteGenres.includes(genre));
      return matchingGenres.length >= 3;
    });
  }

  groupBooksByAuthor(): void {
    this.booksByAuthor = {};
    this.recommendations.forEach(book => {
      const authors = Array.isArray(book.author) ? book.author : [book.author];
      authors.forEach((author: string) => {
        if (this.favoriteAuthors.includes(author)) {
          if (!this.booksByAuthor[author]) {
            this.booksByAuthor[author] = [];
          }
          this.booksByAuthor[author].push(book);
        }
      });
    });
  }

  isArrayOfAuthors(author: string | string[]): boolean {
    return Array.isArray(author);
  }





  getGenres(): string[] {
    const genres = this.recommendations.flatMap(book => book.genres);
    const filteredGenres = genres.filter(genre => this.favoriteGenres.includes(genre));
    return Array.from(new Set(filteredGenres));
  }

  getBooksByGenre(genre: string): any[] {
    return this.recommendations.filter(book =>
      book.genres.includes(genre) && this.favoriteGenres.includes(genre)
    );
  }

  nextPage(): void {
    this.page += 1;
    this.fetchRecommendations();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page -= 1;
      this.fetchRecommendations();
    }
  }

  isNSFW(book: any): boolean {
    const nsfwGenres = ['erotic', 'erotica'];
    return book.genres.some((genre: string) => nsfwGenres.includes(genre.toLowerCase()));
  }
}
