import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'feed',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, FormsModule],
  providers: [WebService, AuthService],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
})
export class FeedComponent implements OnInit {
  feed: any[] = [];
  loading: boolean = true;
  token: string | null = null;

  constructor(
    private webService: WebService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('x-access-token');
    if (this.token) {
      this.loadFeedData();
    } else {
      console.error('No token found, navigating to login.');
      this.router.navigate(['/login']);
    }
  }

  loadFeedData() {
    this.webService.getFeed().subscribe(
      (response: any) => {
        console.log(response);
        this.feed = response.feed || [];
        this.loading = false;
        this.feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },
      (error) => {
        console.error('Error fetching feed data:', error);
        this.loading = false;
      }
    );
  }

  getStarCountRating(stars: number): any[] {
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 >= 0.5 ? 1 : 0;

    return [...new Array(fullStars).fill(0), ...new Array(halfStar).fill(0.5)];
  }

}
