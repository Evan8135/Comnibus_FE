import { Routes } from '@angular/router';
import { BooksComponent } from './books/books.component';
import { BookComponent } from './book/book.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { LoginComponent } from './auth/login/login.component';
import { InboxComponent } from './inbox/inbox.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';
import { ProfileComponent } from './profile/profile.component';
import { RecommendationsComponent } from './recommendations/recommendations.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AddRequestComponent } from './book requests/add requests/add-request.component';
import { RequestsComponent } from './book requests/requests/requests.component';
import { RequestComponent } from './book requests/request/request.component';
import { HomeComponent } from './home/home.component';
import { CurrentReadsComponent } from './bookshelves/current reads/current-reads.component';
import { FeedComponent } from './feed/feed.component';
import { ThoughtsComponent } from './user-thoughts/thoughts/thoughts.component';
import { AddBookComponent } from './add book/add-book.component';
import { ThoughtComponent } from './user-thoughts/thought/thought.component';
import { TopBooksComponent } from './top books/top-books.component';
import { ReadBooksComponent } from './bookshelves/have read/read-books.component';
import { ReviewComponent } from './review/review.component';
import { newBooksComponent } from './new books/new-books.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',  // Redirect to /home when accessing localhost:4200
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'books',
    component: BooksComponent
  },
  {
    path: 'books/:id',
    component: BookComponent
  },
  {
    path: 'add-book',
    component: AddBookComponent
  },
  {
    path: 'books/:id/reviews',
    component: ReviewsComponent
  },
  {
    path: 'review/:id',
    component: ReviewComponent
  },
  {
    path: 'inbox',
    component: InboxComponent
  },
  {
    path: 'users',
    component: UsersComponent
  },
  {
    path: 'users/:id',
    component: UserComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'feed',
    component: FeedComponent
  },
  {
    path: 'currently-reading',
    component: CurrentReadsComponent
  },
  {
    path: 'have-read',
    component: ReadBooksComponent
  },
  {
    path: 'recommendations',
    component: RecommendationsComponent
  },
  {
    path: 'top-books',
    component: TopBooksComponent
  },
  {
    path: 'new-books',
    component: newBooksComponent
  },
  {
    path: 'add-requests',
    component: AddRequestComponent
  },
  {
    path: 'requests',
    component: RequestsComponent
  },
  {
    path: 'requests/:id',
    component: RequestComponent
  },
  {
    path: 'thoughts',
    component: ThoughtsComponent
  },
  {
    path: 'thoughts/:id',
    component: ThoughtComponent
  }
];
