import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';



@Injectable()
export class WebService {
  pageSize: number = 10;

  constructor(private http: HttpClient) {}
//------------------------------------------------------------------------------------------------------------------
// 1. BOOK CALLS
  getBooks(
    page: number,
    titleFilter: string = '',
    authorFilter: string = '',
    genreFilter: string = ''
  ) {
    let params = new HttpParams()
      .set('pn', page.toString()) // Page number
      .set('ps', this.pageSize.toString()); // Page size

      if (titleFilter) {
        params = params.set('title', titleFilter);
      }
      if (authorFilter) {
        params = params.set('author', authorFilter);
      }
      if (genreFilter) {
        params = params.set('genres', genreFilter);
      }

    return this.http
      .get<any>('http://localhost:5000/api/v1.0/books', { params })
      .pipe(
        catchError((error) => {
          console.error('Error fetching books:', error);
          return throwError(() => new Error('Failed to fetch books.'));
        })
      );
  }
  getBook(id: any) {
    return this.http.get<any>('http://localhost:5000/api/v1.0/books/' + id);
  }

//------------------------------------------------------------------------------------------------------------------
// 2. REVIEW CALLS
  postReview(id: any, review: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token); // Pass the token in x-access-token header
    }
    let postData = new FormData();
    postData.append('username', review.username);
    postData.append('title', review.title);
    postData.append('comment', review.comment);
    postData.append('stars', review.stars);
    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + id + '/reviews', postData, {headers})
  }
  getReviews(id: any) {
    return this.http.get<any>('http://localhost:5000/api/v1.0/books/' + id + '/reviews');
  }
  deleteReview(id: any, review: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token); // Pass the token in x-access-token header
    }
    return this.http.delete<any>('http://localhost:5000/api/v1.0/books/' + id + '/reviews/' + review._id, {headers});
  }

  likeReview(id: any, review: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + id + '/reviews/' + review._id + '/like', {}, {headers});
  }

  dislikeReview(id: any, review: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + id + '/reviews/' + review._id + '/dislike', {}, {headers});
  }

//------------------------------------------------------------------------------------------------------------------
// 3. INBOX CALLS
  getMessages() {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/inbox', {headers});
  }
  getMessage(id: string) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/inbox/' + id, {headers});
  }
  markAsRead(id: string) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.put<any>('http://localhost:5000/api/v1.0/inbox/' + id + '/read', {headers});
  }
  deleteMessage(id: string) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.delete<any>('http://localhost:5000/api/v1.0/inbox/' + id, {headers});
  }

//------------------------------------------------------------------------------------------------------------------
// 4. USER CALLS
  getUsers() {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/users', {headers});
  }

  getUser(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/users/' + id, {headers});
  }

  getProfile(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/profile/' + id, {headers});
  }
}
