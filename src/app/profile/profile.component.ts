import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [WebService, AuthService],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  reviews_by_user: any[] = [];
  have_read_books: any[] =[];
  tbrBooks: any[] = [];
  loading: boolean = true;
  token: string | null = null;
  loggedInUserName: string = '';
  followersCount: number = 0;
  followingCount: number = 0;
  editProfileForm: any;
  isEditing: boolean = false;
  previewUrl: string | null = null;
  isUploading: boolean = false;

  constructor(
    private webService: WebService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.token = localStorage.getItem('x-access-token');
    if (this.token) {
      this.webService.getProfile()
        .subscribe((response: any) => {
          this.user = response;
          this.reviews_by_user = response.reviews_by_user || [];
          this.followersCount = response.followers?.length || 0;
          this.followingCount = response.following?.length || 0;
          this.tbrBooks = response.want_to_read || [];
          this.have_read_books = response.have_read || [];

          this.editProfileForm = this.fb.group({
            name: [this.user.name, Validators.required],
            username: [this.user.username, Validators.required],
            email: [this.user.email, [Validators.required, Validators.email]],
            favourite_genres: [this.user.favourite_genres.join(', ')],
            favourite_authors: [this.user.favourite_authors.join(', ')],
            profile_pic: [this.user.profile_pic],
          });
        });
    } else {
      console.error("No token found, navigating to login.");
      this.router.navigate(['/login']);
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  // Method to remove profile picture
  removeProfilePic() {
    const currentPic = this.editProfileForm.value.profile_pic;

    // If there is a Blob URL, revoke it first
    if (currentPic && currentPic.startsWith('blob:')) {
      URL.revokeObjectURL(currentPic);  // Release the Blob URL from memory
      console.log('Blob URL revoked');
    }

    // Reset the profile picture in the form control to the default image or null
    this.editProfileForm.patchValue({ profile_pic: '/images/profile.png' });

    // You can also update the backend if you want to persist the changes
    this.webService.removeProfilePic().subscribe(response => {
      console.log('Profile picture removed successfully');
    }, error => {
      console.error('Error removing profile picture:', error);
    });
  }


  onFileSelected(event: any): void {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Image = e.target.result;
        this.editProfileForm.patchValue({ profile_pic: base64Image });
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is selected, set profile_pic as an empty string
      this.editProfileForm.patchValue({ profile_pic: "" });
    }
  }



  uploadProfilePic(image: File) {
    const formData = new FormData();
    formData.append('image', image);

    this.http.post<any>('http://localhost:5000/api/v1.0/upload-image', formData)
      .subscribe(response => {
        if (response.url) {
          // Update the profile_pic with the permanent URL received from the backend
          this.editProfileForm.patchValue({ profile_pic: response.url });
          this.previewUrl = response.url;  // Optionally, use this for preview
          console.log(this.previewUrl)
        } else {
          console.error('Failed to upload image:', response);
        }
      }, error => {
        console.error('Error uploading image:', error);
      });
  }

  getStarCount(stars: number): any[] {
    const fullStars = Math.floor(stars);  // Get the number of full stars
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;  // Check if there's a half star

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];  // Return full stars and half star if needed
  }



  onSubmit(): void {
    if (this.isUploading) {
      console.log("Please wait for the image to finish uploading...");
      return;
    }

    if (this.editProfileForm.valid) {
      const updatedProfile = this.editProfileForm.value;

      // Show a confirmation popup before proceeding
      const confirmChange = confirm("Are you sure you want to update your profile?");
      if (!confirmChange) {
        return; // Stop submission if user cancels
      }

      updatedProfile.favourite_genres = updatedProfile.favourite_genres.split(',').map((item: string) => item.trim());
      updatedProfile.favourite_authors = updatedProfile.favourite_authors.split(',').map((item: string) => item.trim());

      console.log("Submitting profile:", updatedProfile); // Debugging

      this.webService.updateProfile(updatedProfile).subscribe(
        (response: any) => {
          console.log('Profile updated successfully', response);
          this.user = response;
          this.isEditing = false;
          window.location.reload();
        },
        (error: any) => {
          console.error('Error updating profile', error);
        }
      );
    }
  }


}
