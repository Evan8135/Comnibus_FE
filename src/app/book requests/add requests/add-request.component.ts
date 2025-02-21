import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WebService } from '../../web.service';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'add-requests',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterModule, CommonModule],
  providers: [WebService, AuthService],
  templateUrl: './add-request.component.html',
  styleUrls: ['./add-request.component.css'],
})
export class AddRequestComponent implements OnInit {
  RequestForm!: FormGroup;
  submissionMessage: string = '';
  isLoading: boolean = false;
  loggedInUserName: string = '';

  genres: string[] = [];  // Full list of genres fetched from API
  filteredGenres: string[] = [];  // List of filtered genres based on search query
  selectedGenres: string[] = [];  // Stores selected genres
  genreSearch: string = '';  // Stores the search query

  constructor(
    private fb: FormBuilder,
    private webService: WebService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient  // Inject HttpClient to fetch genres
  ) {
    this.loggedInUserName = this.authService.getLoggedInName();
  }

  ngOnInit(): void {
    this.RequestForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      genreSearch: [''],
      genres: this.fb.array([]),
      language: ['', Validators.required],
      series: [''],
      publishDate: [''],
      isbn: [''],
      username: [{ value: this.loggedInUserName, disabled: true }, Validators.required],
    });

    this.fetchGenres();  // Fetch the genres when the component loads
  }

  // Fetch the list of genres from the API
  fetchGenres() {
    this.http.get<string[]>('http://localhost:5000/api/v1.0/genres').subscribe({
      next: (data) => {
        this.genres = data;
        this.filteredGenres = data;  // Initially show all genres in the filtered list
      },
      error: (error) => {
        console.error('Error fetching genres:', error);
        this.submissionMessage = 'Failed to load genres.';
      }
    });
  }

  // Filter genres based on the search input
  onSearchGenres() {
    const searchQuery = this.RequestForm.get('genreSearch')?.value?.toLowerCase() || '';
    this.filteredGenres = this.genres.filter(genre =>
      genre.toLowerCase().includes(searchQuery)  // Case-insensitive search
    );
  }

  // Toggle genre selection with FormArray synchronization
  toggleGenre(genre: string) {
    const genresArray = this.RequestForm.get('genres') as FormArray;
    const genresToAdd = genre.split(', ').map(g => g.trim());

    genresToAdd.forEach(g => {
      const index = this.selectedGenres.indexOf(genre);

      if (index === -1) {
        this.selectedGenres.push(genre);
        genresArray.push(this.fb.control(genre)); // Add to FormArray
      } else {
        this.selectedGenres.splice(index, 1);
        genresArray.removeAt(index); // Remove from FormArray
      }
    });
  }







  onSubmit(): void {
    if (this.RequestForm.invalid) {
      this.submissionMessage = 'Please fill all required fields!';
      return;
    }

    this.isLoading = true;
    const request = { ...this.RequestForm.value, genres: this.selectedGenres };

    this.webService.postBookRequest(request).subscribe(
      (response) => {
        this.isLoading = false;
        this.submissionMessage = response.message;
      },
      (error) => {
        this.isLoading = false;
        this.submissionMessage = 'Something went wrong, please try again later.';
      }
    );
  }

}
