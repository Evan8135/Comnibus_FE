import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';  // Import WebService

@Component({
  selector: 'recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css'],
  imports: [RouterOutlet, RouterModule, CommonModule],
  providers: [WebService],
  standalone: true
})
export class RecommendationsComponent {
  recommendations: any[] = [];
  booksByAuthor: { [author: string]: any[] } = {}; // Map to store books by author
  booksMatchingMultipleGenres: any[] = [];  // To store books matching 3 or more genres
  errorMessage: string | null = null;
  page: number = 1;
  pageSize: number = 10;

  // User preferences for genres and authors
  favoriteGenres: string[] = [];
  favoriteAuthors: string[] = [];

  constructor(private webService: WebService) {}

  ngOnInit(): void {
    this.fetchRecommendations();
  }

  // Fetch recommendations from the WebService API
  fetchRecommendations(): void {
    this.webService.getRecommendations(this.page, this.pageSize).subscribe(
      (data: any) => {
        console.log(data); // Log the API response to inspect the data structure
        this.recommendations = data.recommended_books;
        this.favoriteGenres = data.favorite_genres || [];
        this.favoriteAuthors = data.favorite_authors || [];

        // Filter recommendations based on favorite genres and authors
        this.filterRecommendations();

        // Filter books that match at least 3 favorite genres
        this.filterBooksByMultipleGenres();

        // Check if recommendations exist and then group them by author
        if (this.recommendations.length > 0) {
          this.groupBooksByAuthor();
        } else {
          this.errorMessage = "No recommendations found.";
        }
      },
      (error) => {
        this.errorMessage = "Please log in to view recommendations.";
        console.error(error);  // Log any error for debugging
      }
    );
  }

  // Filter books based on favorite genres and authors
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

  // Filter books that match at least 3 favorite genres
  filterBooksByMultipleGenres(): void {
    this.booksMatchingMultipleGenres = this.recommendations.filter(book => {
      const matchingGenres = book.genres.filter((genre: string) => this.favoriteGenres.includes(genre));
      return matchingGenres.length >= 3;
    });
  }

  // Group books by author but only for authors that are in the user's favorites
  groupBooksByAuthor(): void {
    this.booksByAuthor = {}; // Reset the map before populating it
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

  // Helper method to check if author is an array
  isArrayOfAuthors(author: string | string[]): boolean {
    return Array.isArray(author);
  }

  // Get a unique list of all genres across all books that are in the favorite genres
  getGenres(): string[] {
    const genres = this.recommendations.flatMap(book => book.genres);
    // Filter out genres that are not in the user's favorite genres
    const filteredGenres = genres.filter(genre => this.favoriteGenres.includes(genre));
    return Array.from(new Set(filteredGenres)); // Remove duplicates
  }

  // Get books by a specific genre, but only if the genre is in favorite genres
  getBooksByGenre(genre: string): any[] {
    return this.recommendations.filter(book =>
      book.genres.includes(genre) && this.favoriteGenres.includes(genre)
    );
  }

  // Handle next page of recommendations
  nextPage(): void {
    this.page += 1;
    this.fetchRecommendations();
  }

  // Handle previous page of recommendations
  previousPage(): void {
    if (this.page > 1) {
      this.page -= 1;
      this.fetchRecommendations();
    }
  }
}
