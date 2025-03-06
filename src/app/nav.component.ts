import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WebService } from './web.service';  // Import WebService

@Component({
  selector: 'navigation',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './nav.component.html',
  providers: [WebService]
})
export class NavComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  hasUnreadMessages: boolean = false;
  profilePicUrl: string = '/images/profile.png';


  constructor(private webService: WebService) {
    this.updateAuthStatus();
  }

  ngOnInit(): void {
    this.updateAuthStatus();
    if (this.isLoggedIn) {
      this.fetchUserProfile();
    }
    this.checkUnreadMessages();
  }


  updateAuthStatus() {
    const token = localStorage.getItem('x-access-token');
    this.isLoggedIn = token !== null;
    this.checkUnreadMessages();

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.isAdmin = payload && payload.admin === true;
    } else {
      this.isAdmin = false;
    }
  }

  fetchUserProfile() {
    if (this.isLoggedIn) {
      this.webService.getProfile().subscribe({
        next: (response: any) => {
          // Set the profile picture URL to the one returned by the backend
          this.profilePicUrl = response.profile_pic || '/images/profile.png';
        },
        error: (err) => {
          console.error('Error fetching user profile:', err);
        }
      });
    }
  }

  fetchUserFeed() {
    if (this.isLoggedIn) {
      this.webService.getFeed().subscribe({

      });
    }
  }

  checkUnreadMessages() {
    if (this.isLoggedIn) {
      this.webService.getMessages().subscribe({
        next: (response: any) => {
          // Update unread messages status based on backend response
          this.hasUnreadMessages = response.hasUnreadMessages || false;
        },
        error: (err) => {
          console.error('Error fetching unread messages:', err);
        }
      });
    }
  }

  toggleLogin() {
    if (this.isLoggedIn) {
      localStorage.removeItem('x-access-token');
    } else {
      console.warn('Toggle login called but no login mechanism provided');
    }
    this.updateAuthStatus();
  }

  toggleAdmin() {
    console.warn('Admin privileges cannot be toggled directly in the component.');
    this.updateAuthStatus();
  }
}
