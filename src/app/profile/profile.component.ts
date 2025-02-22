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
  loading: boolean = true;
  token: string | null = null;
  loggedInUserName: string = '';
  followersCount: number = 0;
  followingCount: number = 0;
  editProfileForm: any;
  isEditing: boolean = false;
  previewUrl: string | null = null;

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


  onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    // Preview the image temporarily as a Blob URL
    this.previewUrl = URL.createObjectURL(file);
    this.editProfileForm.patchValue({ profile_pic: file });

    // Upload the image to the backend
    this.uploadProfilePic(file);  // Upload the image when a file is selected
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
        } else {
          console.error('Failed to upload image:', response);
        }
      }, error => {
        console.error('Error uploading image:', error);
      });
  }




  onSubmit(): void {
    if (this.editProfileForm.valid) {
      const updatedProfile = this.editProfileForm.value;
      updatedProfile.favourite_genres = updatedProfile.favourite_genres.split(',').map((item: string) => item.trim());
      updatedProfile.favourite_authors = updatedProfile.favourite_authors.split(',').map((item: string) => item.trim());

      // Call the WebService to update the profile
      this.webService.updateProfile(updatedProfile).subscribe(
        (response: any) => {
          console.log('Profile updated successfully', response);
          this.user = response;  // Update local user data with the response
          this.isEditing = false; // Exit edit mode
          window.location.reload();
        },
        (error: any) => {
          console.error('Error updating profile', error);
        }
      );
    }
  }

}
