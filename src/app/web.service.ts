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

  getRecommendations(page: number, pageSize: number) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    const token = localStorage.getItem('x-access-token');
    const headers = token ? new HttpHeaders().set('x-access-token', token) : new HttpHeaders();

    return this.http.get<{ recommended_books: any[] }>('http://localhost:5000/api/v1.0/recommendations', { params, headers });
  }

  markBookAsRead(id: string, rating: number) {
    const token = localStorage.getItem('x-access-token');
    const headers = token ? new HttpHeaders().set('x-access-token', token) : new HttpHeaders();

    const formData = new FormData();
    formData.append("stars", rating.toString());

    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + id + '/have-read', formData, { headers });
  }



  removeBookFromRead(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token); // Pass the token in x-access-token header
    }
    return this.http.delete('http://localhost:5000/api/v1.0/books/' + id + '/have-read', {headers});
  }

  addToWantToRead(id: any) {
    const token = localStorage.getItem('x-access-token');
    const headers = token ? new HttpHeaders().set('x-access-token', token) : new HttpHeaders();
    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + id + '/want-to-read', {}, { headers })
  }

  removeBookFromTBR(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token); // Pass the token in x-access-token header
    }
    return this.http.delete('http://localhost:5000/api/v1.0/books/' + id + '/want-to-read', {headers});
  }

  addToCurrentReads(id: any) {
    const token = localStorage.getItem('x-access-token');
    const headers = token ? new HttpHeaders().set('x-access-token', token) : new HttpHeaders();
    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + id + '/current-read', {}, { headers })
  }

  getCurrentReads() {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/currently-reading', { headers });
  }

  // Get a specific book from the "currently reading" list of a user
  getCurrentRead(bookId: string) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/currently-reading/' + bookId, { headers });
  }

  // Update reading progress for a book in the "currently reading" list
  updateReadingProgress(bookId: string, currentPage: number) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    const formData = new FormData();
    formData.append("current_page", currentPage.toString());

    return this.http.post<any>('http://localhost:5000/api/v1.0/currently-reading/' + bookId, formData, { headers });
  }

  // Remove a book from the "currently reading" list
  removeFromCurrentReads(id: any) {
    const token = localStorage.getItem('x-access-token');
    const headers = token ? new HttpHeaders().set('x-access-token', token) : new HttpHeaders();
    return this.http.delete<any>('http://localhost:5000/api/v1.0/books/' + id + '/currently-reading', { headers });
  }

  addToFavourites(id: any) {
    const token = localStorage.getItem('x-access-token');
    const headers = token ? new HttpHeaders().set('x-access-token', token) : new HttpHeaders();
    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + id + '/add-to-favourites', {}, { headers })
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
  getReview(id: any, review: any) {
    return this.http.get<any>('http://localhost:5000/api/v1.0/books/' + id + '/reviews/' + review._id);
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

  followUser(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/users/' + id + '/follow', {}, {headers});
  }

  unfollowUser(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/users/' + id + '/unfollow', {}, {headers});
  }

  getProfile() {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/profile', {headers});
  }

  getFeed() {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/feed', {headers});
  }

  updateProfile(profileData: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.put<any>('http://localhost:5000/api/v1.0/profile', profileData, {headers});
  }

  removeProfilePic() {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/remove-profile-pic', {headers});
  }



//------------------------------------------------------------------------------------------------------------------
// 5. BOOK REQUEST CALLS
  getRequests(page: number) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('x-access-token', token);
    }

    let params = new HttpParams()
      .set('pn', page.toString()) // Page number
      .set('ps', this.pageSize.toString()); // Page size

    return this.http
      .get<any>('http://localhost:5000/api/v1.0/requests', { params, headers })
      .pipe(
        catchError((error) => {
          console.error('Error fetching books:', error);
          return throwError(() => new Error('Failed to fetch books.'));
        })
      );
  }

  getRequest(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/requests/' + id, { headers });
  }

  postBookRequest(request: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token); // Pass the token in x-access-token header
    }

    let postData = new FormData();
    postData.append('username', request.username);
    postData.append('title', request.title);
    postData.append('author', request.author);
    postData.append('genres', request.genres);
    postData.append('language', request.language);

    // Append optional fields if provided
    if (request.series) {
      postData.append('series', request.series);
    }
    if (request.publishDate) {
      postData.append('publishDate', request.publishDate);
    }
    if (request.isbn) {
      postData.append('isbn', request.isbn);
    }

    return this.http.post<any>('http://localhost:5000/api/v1.0/add-requests', postData, { headers });
  }

  approveRequest(id: any, approveData: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/requests/'+ id + '/approve', approveData, { headers });
  }

  rejectRequest(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/requests/'+ id, '/reject', { headers });
  }


//------------------------------------------------------------------------------------------------------------------
// 6. USER THOUGHT CALLS
  postThought(thought: any, page: number) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token); // Pass the token in x-access-token header
    }
    let postData = new FormData();
    postData.append('username', thought.username);
    postData.append('comment', thought.comment);
    return this.http.post<any>('http://localhost:5000/api/v1.0/thoughts', postData, {headers})
  }
  getThoughts() {
    return this.http.get<any>('http://localhost:5000/api/v1.0/thoughts');
  }
  getThought(id: any) {
    return this.http.get<any>('http://localhost:5000/api/v1.0/thoughts/' + id);
  }
  deleteThought(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token); // Pass the token in x-access-token header
    }
    return this.http.delete<any>('http://localhost:5000/api/v1.0/thoughts' + id, {headers});
  }

  likeThought(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/thoughts/' + id + '/like', {}, {headers});
  }

  dislikeThought(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/thoughts/' + id + '/dislike', {}, {headers});
  }
}
