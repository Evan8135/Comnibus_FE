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
  book_awards: any[] = [];
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
        this.book_awards = response.awards || [];

        this.initForm();
        this.fetchGenres();
        this.fetchAuthors();
      });
    } else {
      console.error("No token found, navigating to login.");
      this.router.navigate(['/login']);
    }
  }

  initForm() {
    this.editProfileForm = this.fb.group({
      name: [this.user.name, Validators.required],
      username: [this.user.username, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]],
      pronouns: [this.user.pronouns || 'prefer not to say'],
      genreSearch: [''],
      authorSearch: [''],
      profile_pic: [this.user.profile_pic || '/images/profile.png'],
      favourite_genres: this.fb.array([]),
      favourite_authors: this.fb.array([]),
    });

    if (this.user.favourite_genres) {
      this.setGenres(this.user.favourite_genres);
    }
    if (this.user.favourite_authors) {
      this.setAuthors(this.user.favourite_authors);
    }

    this.previewUrl = this.user.profile_pic;
  }

  setGenres(genres: string[]) {
    const genreArray = this.editProfileForm.get('favourite_genres') as FormArray;
    genres.forEach(genre => {
      genreArray.push(new FormControl(genre));
    });
  }

  setAuthors(authors: string[]) {
    const authorArray = this.editProfileForm.get('favourite_authors') as FormArray;
    authors.forEach(author => {
      authorArray.push(new FormControl(author));
    });
  }

  fetchGenres() {
    this.http.get<string[]>('http://localhost:5000/api/v1.0/genres').subscribe({
      next: (data) => {
        this.genres = data;
        this.filteredGenres = data;
      },
      error: (error) => {
        console.error('Error fetching genres:', error);
      }
    });
  }

  fetchAuthors() {
    this.http.get<string[]>('http://localhost:5000/api/v1.0/authors').subscribe({
      next: (data) => {
        this.authors = data;
        this.filteredAuthors = data;
      },
      error: (error) => {
        console.error('Error fetching authors:', error);
      }
    });
  }

  onSearchGenres() {
    const query = this.editProfileForm.controls['genreSearch'].value.toLowerCase();
    this.filteredGenres = this.genres.filter(genre => genre.toLowerCase().includes(query));
  }

  onSearchAuthors() {
    const searchQuery = this.editProfileForm.get('authorSearch')?.value.toLowerCase() || '';
    this.filteredAuthors = this.authors.filter(author =>
      author.toLowerCase().includes(searchQuery)
    );
  }

  toggleGenre(genre: string) {
    const genreArray = this.editProfileForm.get('favourite_genres') as FormArray;
    const index = genreArray.value.indexOf(genre);
    if (index === -1) {
      genreArray.push(new FormControl(genre));
    } else {
      genreArray.removeAt(index);
    }
  }

  toggleAuthor(author: string) {
    const authorArray = this.editProfileForm.get('favourite_authors') as FormArray;
    const index = authorArray.value.indexOf(author);
    if (index === -1) {
      authorArray.push(new FormControl(author));
    } else {
      authorArray.removeAt(index);
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.initForm();
    }
  }

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

  removeAuthor(author: string) {
    const index = this.selectedAuthors.indexOf(author);
    if (index !== -1) {
      this.selectedAuthors.splice(index, 1);
    }
  }

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
        this.book_awards = response.awards || [];

        this.initForm();
        this.fetchGenres();
        this.fetchAuthors();
      });}
  }

  getStarCount(stars: number): any[] {
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;
    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];
  }

  getAwardImage(award: string): string {
    const awardImages: { [key: string]: string } = {
      "First Book Read": "/images/1book.png",
      "5 Books Read": "/images/5books.png",
      "10 Books Read": "/images/10books.png",
      "25 Books Read": "/images/25books.png",
      "50 Books Read": "/images/50books.png",
      "100 Books Read": "/images/100books.png"
    };
    return awardImages[award] || '/images/default_award.png';
  }

}
