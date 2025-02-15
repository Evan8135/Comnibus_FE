import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';  // Import WebService

// Define the structure of a book object


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
  sameAuthorBooks: any[] = [];
  errorMessage: string | null = null;
  page: number = 1;
  pageSize: number = 10;

  constructor(private webService: WebService) {}

  ngOnInit(): void {
    this.fetchRecommendations();
  }

  fetchRecommendations(): void {
    this.webService.getRecommendations(this.page, this.pageSize).subscribe(
      (data: any) => {
        this.recommendations = data.recommended_books;
        if (this.recommendations.length > 0) {
          this.getSameAuthorBooks(this.recommendations[0].author);
        }
      },
      (error) => {
        this.errorMessage = "Please log in to view recommendations.";
      }
    );
  }

  // Helper method to check if author is an array
  isArrayOfAuthors(author: string | string[]): boolean {
    return Array.isArray(author);
  }

  // Get unique genres from the recommendations
  getGenres(): string[] {
    const genres = this.recommendations.flatMap(book => book.genres);
    return Array.from(new Set(genres)); // Remove duplicates
  }

  // Get books filtered by genre
  getBooksByGenre(genre: string): any[] {
    return this.recommendations.filter(book => book.genres.includes(genre));
  }

  // Get books written by the same author
  getSameAuthorBooks(author: string | string[]): void {
    if (!author) return;
    this.sameAuthorBooks = this.recommendations.filter(book => {
      return Array.isArray(author)
        ? author.some(a => book.author.includes(a))
        : book.author === author;
    });
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
}
