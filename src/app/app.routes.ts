import { Routes } from '@angular/router';
import { BooksComponent } from './books/books.component';
import { BookComponent } from './book/book.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { LoginComponent } from './auth/login/login.component';
import { InboxComponent } from './inbox/inbox.component';
import { UsersComponent } from './users/users.component';
import { UserComponent } from './user/user.component';


export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
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
  }
];
