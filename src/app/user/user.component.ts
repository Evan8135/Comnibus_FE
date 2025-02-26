import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'user',
  standalone: true,
  imports: [CommonModule],
  providers: [WebService, AuthService],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user: any = null;  // The current user's details
  reviews_by_user: any[] = []; // Array for reviews by this user
  followersCount: number = 0;
  followingCount: number = 0;
  isFollowing: boolean = false;
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private webService: WebService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Get user ID from route
    const userId = this.route.snapshot.paramMap.get('id');

    // Fetch user data
    this.webService.getUser(userId)
      .subscribe((response: any) => {
        this.user = response.user;  // Store user info
        this.reviews_by_user = response.reviews_by_user;  // Store reviews
        this.followersCount = response.user.followers.length;  // Assuming followers is an array
        this.followingCount = response.user.following.length;  // Assuming following is an array

        this.webService.getProfile().subscribe((profileResponse: any) => {
          this.currentUser = profileResponse;
          this.isFollowing = this.user.followers.includes(this.currentUser._id);
        });
      });
  }

  followUser() {
    if (!this.user) return;
    this.webService.followUser(this.user._id).subscribe(() => {
      this.isFollowing = true;
      this.followersCount += 1;
    });
  }

  unfollowUser() {
    if (!this.user) return;
    this.webService.unfollowUser(this.user._id).subscribe(() => {
      this.isFollowing = false;
      this.followersCount -= 1;
    });
  }





}
