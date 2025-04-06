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

  genres: string[] = [];
  filteredGenres: string[] = [];
  selectedGenres: string[] = [];
  genreSearch: string = '';

  constructor(
    private fb: FormBuilder,
    private webService: WebService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
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
      isbn: [''],
      username: [{ value: this.loggedInUserName, disabled: true }, Validators.required],
    });

    this.fetchGenres();
  }

  fetchGenres() {
    this.http.get<string[]>('http://localhost:5000/api/v1.0/genres').subscribe({
      next: (data) => {
        this.genres = data;
        this.filteredGenres = data;
      },
      error: (error) => {
        console.error('Error fetching genres:', error);
        this.submissionMessage = 'Failed to load genres.';
      }
    });
  }

  onSearchGenres() {
    const searchQuery = this.RequestForm.get('genreSearch')?.value?.toLowerCase() || '';
    this.filteredGenres = this.genres.filter(genre =>
      genre.toLowerCase().includes(searchQuery)
    );
  }

  toggleGenre(genre: string) {
    const genresArray = this.RequestForm.get('genres') as FormArray;
    const trimmedGenre = genre.trim();

    const index = this.selectedGenres.indexOf(trimmedGenre);

    if (index === -1) {
      this.selectedGenres.push(trimmedGenre);
      genresArray.push(this.fb.control(trimmedGenre));
    } else {
      this.selectedGenres.splice(index, 1);

      const formIndex = genresArray.controls.findIndex(control => control.value === trimmedGenre);
      if (formIndex !== -1) {
        genresArray.removeAt(formIndex);
      }
    }
  }

  onSubmit(): void {
    if (this.RequestForm.invalid) {
      this.submissionMessage = 'Please fill all required fields!';
      return;
    }

    this.isLoading = true;

    const authorsString = this.RequestForm.value.author;
    if (!authorsString || authorsString.trim() === '') {
      this.submissionMessage = 'At least one author is required.';
      return;
    }

    const authorsArray = authorsString
      .split(',')
      .map((author: string) => author.trim());

    const request = {
      ...this.RequestForm.value,
      author: authorsArray,
      genres: this.selectedGenres,
    };

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
