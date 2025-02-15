import { Routes } from '@angular/router';
import { BooksComponent } from './books/books.component';
import { BookComponent } from './book/book.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { LoginComponent } from './auth/login/login.component';
import { InboxComponent } from './inbox/inbox.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';
import { ProfileComponent } from './profile/profile.component';
import { ReviewComponent } from './review/review.component';
import { RecommendationsComponent } from './recommendations/recommendations.component';
import { SignupComponent } from './auth/signup/signup.component';


export const routes: Routes = [
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
    path: 'books/:id/reviews',
    component: ReviewsComponent
  },
  {
    path: 'books/:id/reviews/:id',
    component:ReviewComponent
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
    path: 'recommendations',
    component: RecommendationsComponent
  }
];
