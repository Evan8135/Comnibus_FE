import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [AuthService],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm: any;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  genres: string[] = [];  // Full list of genres fetched from API
  authors: string[] = [];
  filteredGenres: string[] = [];  // List of filtered genres based on search query
  filteredAuthors: string[] = [];
  selectedGenres: string[] = [];  // Stores selected genres
  selectedAuthors: string[] = [];
  genreSearch: string = '';  // Stores the search query
  authorSearch: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private http: HttpClient, private router: Router) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      pronouns: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      user_type: ['', Validators.required],
      favourite_genres: this.fb.array([], this.minSelectedCheckboxes(3)), // Custom validator for at least 3 genres
      favourite_authors: this.fb.array([]),
      genreSearch: ['', Validators.required],  // Add genreSearch as a form control
      authorSearch: ['']
    });
  }

  ngOnInit() {
    this.fetchGenres();  // Fetch genres when the component loads
    this.fetchAuthors();
  }

  // Fetch the list of genres from the Flask API
  fetchGenres() {
    this.http.get<string[]>('http://localhost:5000/api/v1.0/genres').subscribe({
      next: (data) => {
        this.genres = data;  // Store the full list of genres
        this.filteredGenres = data;  // Initially show all genres in filtered list
      },
      error: (error) => {
        console.error('Error fetching genres:', error);
        this.errorMessage = 'Failed to load genres.';
      }
    });
  }

  fetchAuthors() {
    this.http.get<string[]>('http://localhost:5000/api/v1.0/authors').subscribe({
      next: (data) => {
        this.authors = data;  // Store the full list of genres
        this.filteredAuthors = data;  // Initially show all genres in filtered list
      },
      error: (error) => {
        console.error('Error fetching Authors:', error);
        this.errorMessage = 'Failed to load authors.';
      }
    });
  }

  // Filter genres based on the search input
  onSearchGenres() {
    const searchQuery = this.signupForm.get('genreSearch')?.value.toLowerCase() || '';
    this.filteredGenres = this.genres.filter(genre =>
      genre.toLowerCase().includes(searchQuery)
    );
  }

  onSearchAuthors() {
    const searchQuery = this.signupForm.get('authorSearch')?.value.toLowerCase() || '';
    this.filteredAuthors = this.authors.filter(author =>
      author.toLowerCase().includes(searchQuery)
    );
  }

  // Toggle genre selection (adding/removing)
  toggleGenre(genre: string) {
    const index = this.selectedGenres.indexOf(genre);
    if (index === -1) {
      this.selectedGenres.push(genre);
    } else {
      this.selectedGenres.splice(index, 1);
    }

    // Update the FormArray for validation
    const favouriteGenres = this.signupForm.get('favourite_genres') as FormArray;
    favouriteGenres.clear();
    this.selectedGenres.forEach(g => favouriteGenres.push(new FormControl(g)));
    favouriteGenres.updateValueAndValidity();
  }

  toggleAuthor(author: string) {
    const index = this.selectedAuthors.indexOf(author);
    if (index === -1) {
      this.selectedAuthors.push(author);
    } else {
      this.selectedAuthors.splice(index, 1);
    }

    // Update the FormArray for validation
    const favouriteAuthors = this.signupForm.get('favourite_authors') as FormArray;
    favouriteAuthors.clear();
    this.selectedAuthors.forEach(a => favouriteAuthors.push(new FormControl(a)));
    favouriteAuthors.updateValueAndValidity();
  }

  // Custom validator to check if at least 3 genres are selected
  minSelectedCheckboxes(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value.length >= min ? null : { minlength: true };
    };
  }

  // Helper method to check if a form control is invalid
  isInvalid(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    return control?.invalid && (control?.touched || control?.dirty);
  }

  // Helper method to check if the form is incomplete (for showing error messages)
  isIncomplete(): boolean {
    return this.signupForm.invalid;
  }

  // Getter for favouriteGenres FormArray
  get favouriteGenres() {
    return this.signupForm.get('favourite_genres') as FormArray;
  }

  get favouriteAuthors() {
    return this.signupForm.get('favourite_authors') as FormArray;
  }

  // Submit form logic
  onSubmit() {
    if (this.signupForm.valid) {
      const { name, username, pronouns, password, email, user_type, favourite_genres, favourite_authors } = this.signupForm.value;
      const admin = false; // Admin is always false

      this.authService.signup(name, username, pronouns, password, email, user_type, favourite_genres.join(','), favourite_authors, admin).subscribe({
        next: () => {
          this.successMessage = 'Signup successful!';
          this.errorMessage = null;
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.successMessage = null;
          this.errorMessage = error.error.message
          console.error(error);
        }
      });
    } else {
      this.errorMessage = 'Please select at least 3 genres.';
    }
  }
}
