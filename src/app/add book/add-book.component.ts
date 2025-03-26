import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'add-book',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterModule, CommonModule],
  providers: [WebService, AuthService],
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css'],
})
export class AddBookComponent implements OnInit {
  BookForm!: FormGroup;
  submissionMessage = '';
  isLoading = false;
  loggedInUserName = '';

  genres: string[] = [];
  filteredGenres: string[] = [];
  selectedGenres: string[] = [];
  genreSearch = '';
  previewUrl: string | null = null;
  isApproving = false;
  isUploading = false;

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
    this.BookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      genreSearch: [''],
      genres: this.fb.array([]),
      language: ['', Validators.required],
      series: [''],
      publishDate: [''],
      isbn: [''],
      description: [''],
      characters: [''],
      triggers: [''],
      bookFormat: [''],
      edition: [''],
      pages: [0, [Validators.min(1)]],
      publisher: [''],
      firstPublishDate: [''],
      awards: [''],
      coverImg: ['/images/no_cover.jpg'],
      price: [0.0, [Validators.min(0)]]
    });

    this.fetchGenres();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
      this.uploadCoverImg(file);
    };
    reader.readAsDataURL(file);
  }

  uploadCoverImg(image: File) {
    this.isUploading = true;
    const formData = new FormData();
    formData.append('image', image);

    this.http.post<any>('http://localhost:5000/api/v1.0/upload-image', formData).subscribe(
      response => {
        if (response.url) {
          this.BookForm.patchValue({ coverImg: response.url });
          this.previewUrl = response.url;
        } else {
          console.error('Failed to upload image:', response);
        }
        this.isUploading = false;
      },
      error => {
        console.error('Error uploading image:', error);
        this.isUploading = false;
      }
    );
  }

  fetchGenres(): void {
    this.http.get<string[]>('http://localhost:5000/api/v1.0/genres').subscribe({
      next: data => {
        this.genres = data;
        this.filteredGenres = data;
      },
      error: error => {
        console.error('Error fetching genres:', error);
        this.submissionMessage = 'Failed to load genres.';
      }
    });
  }

  onSearchGenres(): void {
    const searchQuery = this.BookForm.get('genreSearch')?.value?.toLowerCase() || '';
    this.filteredGenres = this.genres.filter(genre => genre.toLowerCase().includes(searchQuery));
  }

  toggleGenre(genre: string): void {
    const genresArray = this.BookForm.get('genres') as FormArray;
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
    if (this.BookForm.invalid) {
      this.submissionMessage = 'Please fill all required fields!';
      return;
    }

    this.isLoading = true;

     // Convert authors from comma-separated string to an array
     const authorsString = this.BookForm.value.author;
     const authorsArray = authorsString
       ? authorsString.split(',').map((author: string) => author.trim())
       : [];

     // Awards
     const awardsString = this.BookForm.value.awards;
     const awardsArray = awardsString
       ? awardsString.split(',').map((award: string) => award.trim()).join(", ")
       : "";

     // Characters
     const charactersString = this.BookForm.value.characters;
     const charactersArray = charactersString
       ? charactersString.split(',').map((character: string) => character.trim()).join(", ")
      : "";

     // Triggers
     const triggersString = this.BookForm.value.triggers;
     const triggersArray = triggersString
       ? triggersString.split(',').map((trigger: string) => trigger.trim()).join(", ")
       : "";

    const book = {
      ...this.BookForm.value,
      author: authorsArray, // Now the authors are an array
      genres: this.selectedGenres, // Genres already handled as an array
      characters: charactersArray,
      awards: awardsArray,
      triggers: triggersArray
    };

    this.webService.postBook(book).subscribe(
      (response) => {
        this.isLoading = false;
        this.previewUrl = response.coverImg;
        this.submissionMessage = response.message;
      },
      (error) => {
        this.isLoading = false;
        this.submissionMessage = 'Something went wrong, please try again later.';
      }
    );
  }

}
