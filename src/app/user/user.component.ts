import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'user',
  standalone: true,
  imports: [RouterModule, CommonModule],
  providers: [WebService, AuthService],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user: any = null;  // The current user's details
  reviews_by_user: any[] = []; // Array for reviews by this user
  books_by_author: any[] = [];
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
    const userId = this.route.snapshot.paramMap.get('id');

    this.webService.getUser(userId).subscribe((response: any) => {
      this.user = response.user;
      this.reviews_by_user = response.reviews_by_user;
      this.books_by_author = response.books_by_author;
      this.followersCount = response.user.followers.length;
      this.followingCount = response.user.following.length;

      // Fetch the current user's profile
      this.webService.getProfile().subscribe((profileResponse: any) => {
        this.currentUser = profileResponse;

        // Get followers from AuthService (which returns a string)
        const followersData = this.authService.getFollowers();

        // Directly check if the user ID is in the string (without parsing)
        this.isFollowing = followersData.includes(this.user._id);
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
