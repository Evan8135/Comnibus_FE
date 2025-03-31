import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'profile',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  providers: [WebService, AuthService],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  selectedGenres: string[] = [];
  selectedAuthors: string[] = [];
  reviews_by_user: any[] = [];
  favouriteBooks: any[] = [];
  currentlyReading: any[] = [];
  have_read_books: any[] = [];
  tbrBooks: any[] = [];
  loading: boolean = true;
  token: string | null = null;
  loggedInUserName: string = '';
  followersCount: number = 0;
  followingCount: number = 0;
  editProfileForm!: FormGroup;
  isEditing: boolean = false;
  previewUrl: string | null = null;
  isUploading: boolean = false;

  // List of genres, authors, and their filtered lists
  genres: string[] = [];
  filteredGenres: string[] = [];
  authors: string[] = [];
  filteredAuthors: string[] = [];

  constructor(
    private webService: WebService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    //@Inject('Window') private window: Window
  ) { }

  ngOnInit(): void {
    this.token = localStorage.getItem('x-access-token');
    if (this.token) {
      this.webService.getProfile().subscribe((response: any) => {
        this.user = response;
        this.reviews_by_user = response.reviews_by_user || [];
        this.followersCount = response.followers?.length || 0;
        this.followingCount = response.following?.length || 0;
        this.favouriteBooks = response.favourite_books || 0;
        this.currentlyReading = response.currently_reading || [];
        this.tbrBooks = response.want_to_read || [];
        this.have_read_books = response.have_read || [];

        // Initialize form and fetch genres/authors after data is loaded
        this.initForm();
        this.fetchGenres();
        this.fetchAuthors();
      });
    } else {
      console.error("No token found, navigating to login.");
      this.router.navigate(['/login']);
    }
  }

  // Initialize form with user data
  initForm() {
    this.editProfileForm = this.fb.group({
      name: [this.user.name, Validators.required],
      username: [this.user.username, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]],
      pronouns: [this.user.pronouns || 'prefer not to say'],
      genreSearch: [''],  // Add genreSearch as a form control
      authorSearch: [''],  // Add authorSearch as a form control
      profile_pic: [this.user.profile_pic || '/images/profile.png'],
      favourite_genres: this.fb.array([]),  // Initialize as FormArray
      favourite_authors: this.fb.array([]),  // Initialize as FormArray
    });

    // Set the selected genres/authors to the form control
    if (this.user.favourite_genres) {
      this.setGenres(this.user.favourite_genres);
    }
    if (this.user.favourite_authors) {
      this.setAuthors(this.user.favourite_authors);
    }

    this.previewUrl = this.user.profile_pic;
  }

  // Set the genres in the FormArray
  setGenres(genres: string[]) {
    const genreArray = this.editProfileForm.get('favourite_genres') as FormArray;
    genres.forEach(genre => {
      genreArray.push(new FormControl(genre));
    });
  }

  // Set the authors in the FormArray
  setAuthors(authors: string[]) {
    const authorArray = this.editProfileForm.get('favourite_authors') as FormArray;
    authors.forEach(author => {
      authorArray.push(new FormControl(author));
    });
  }

  // Fetch genres from the API
  fetchGenres() {
    this.http.get<string[]>('http://localhost:5000/api/v1.0/genres').subscribe({
      next: (data) => {
        this.genres = data;  // Store the full list of genres
        this.filteredGenres = data;  // Initially show all genres in filtered list
      },
      error: (error) => {
        console.error('Error fetching genres:', error);
      }
    });
  }

  // Fetch authors from the API
  fetchAuthors() {
    this.http.get<string[]>('http://localhost:5000/api/v1.0/authors').subscribe({
      next: (data) => {
        this.authors = data;  // Store the full list of authors
        this.filteredAuthors = data;  // Initially show all authors in filtered list
      },
      error: (error) => {
        console.error('Error fetching authors:', error);
      }
    });
  }

  // Filter genres based on the search input
  onSearchGenres() {
    const query = this.editProfileForm.controls['genreSearch'].value.toLowerCase();
    this.filteredGenres = this.genres.filter(genre => genre.toLowerCase().includes(query));
  }

  // Filter authors based on the search input
  onSearchAuthors() {
    const searchQuery = this.editProfileForm.get('authorSearch')?.value.toLowerCase() || '';
    this.filteredAuthors = this.authors.filter(author =>
      author.toLowerCase().includes(searchQuery)
    );
  }

  // Toggle genre selection
  toggleGenre(genre: string) {
    const genreArray = this.editProfileForm.get('favourite_genres') as FormArray;
    const index = genreArray.value.indexOf(genre);
    if (index === -1) {
      genreArray.push(new FormControl(genre));
    } else {
      genreArray.removeAt(index);
    }
  }

  // Toggle author selection
  toggleAuthor(author: string) {
    const authorArray = this.editProfileForm.get('favourite_authors') as FormArray;
    const index = authorArray.value.indexOf(author);
    if (index === -1) {
      authorArray.push(new FormControl(author));
    } else {
      authorArray.removeAt(index);
    }
  }

  // Toggle edit mode for profile
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.initForm();
    }
  }

  // Handle file selection for profile picture
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
      this.uploadProfilePic(file);
    };
    reader.readAsDataURL(file);
  }

  // Upload new profile picture
  uploadProfilePic(image: File) {
    this.isUploading = true;
    const formData = new FormData();
    formData.append('image', image);

    this.http.post<any>('http://localhost:5000/api/v1.0/upload-image', formData).subscribe(
      response => {
        if (response.url) {
          this.editProfileForm.patchValue({ profile_pic: response.url });
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

  // Remove the profile picture
  removeProfilePic() {
    if (this.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.editProfileForm.patchValue({ profile_pic: '/images/profile.png' });
    this.previewUrl = '/images/profile.png';

    this.webService.removeProfilePic().subscribe(
      () => console.log('Profile picture removed successfully'),
      error => console.error('Error removing profile picture:', error)
    );
  }

  removeGenre(genre: string) {
    const index = this.selectedGenres.indexOf(genre);
    if (index !== -1) {
      this.selectedGenres.splice(index, 1);
    }
  }

  // Remove author from selected list
  removeAuthor(author: string) {
    const index = this.selectedAuthors.indexOf(author);
    if (index !== -1) {
      this.selectedAuthors.splice(index, 1);
    }
  }

  // Submit updated profile data
  onSubmit(): void {
    if (this.isUploading) {
      console.log("Please wait for the image to finish uploading...");
      return;
    }

    if (this.editProfileForm.valid) {
      const updatedProfile = this.editProfileForm.value;

      const confirmChange = confirm("Are you sure you want to update your profile?");
      if (!confirmChange) return;

      updatedProfile.favourite_genres = updatedProfile.favourite_genres.map((item: string) => item.trim());
      updatedProfile.favourite_authors = updatedProfile.favourite_authors.map((item: string) => item.trim());

      console.log('Submitting updated profile data:', updatedProfile);

      this.webService.updateProfile(updatedProfile).subscribe(
        (response: any) => {
          console.log('Profile updated successfully', response);
          this.user = response;
          this.isEditing = false;
          this.previewUrl = response.profile_pic;
          this.fetchProfile();
        },
        (error: any) => {
          console.error('Error updating profile', error);
        }
      );
    }
  }

  fetchProfile() {
    this.token = localStorage.getItem('x-access-token');
    if (this.token) {
      this.webService.getProfile().subscribe((response: any) => {
        this.user = response;
        this.reviews_by_user = response.reviews_by_user || [];
        this.followersCount = response.followers?.length || 0;
        this.followingCount = response.following?.length || 0;
        this.favouriteBooks = response.favourite_books || 0;
        this.currentlyReading = response.currently_reading || [];
        this.tbrBooks = response.want_to_read || [];
        this.have_read_books = response.have_read || [];

        // Initialize form and fetch genres/authors after data is loaded
        this.initForm();
        this.fetchGenres();
        this.fetchAuthors();
      });}
  }

  // Helper method to calculate star ratings
  getStarCount(stars: number): any[] {
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;
    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];
  }
}
