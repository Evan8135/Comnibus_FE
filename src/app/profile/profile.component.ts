import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'profile',
  standalone: true,
  imports: [CommonModule],
  providers: [WebService, AuthService],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;  // The current user's details
  reviews_by_user: any[] = []; // Array for reviews by this user
  loading: boolean = true;
  token: string | null = null;
  loggedInUserName: string = '';
  followersCount: number = 0;
  followingCount: number = 0;

  constructor(
    private webService: WebService,
    private authService: AuthService,
    private router: Router
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
        });
    } else {
      console.error("No token found, navigating to login.");
      this.router.navigate(['/login']);
    }
  }
}
