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
    genreFilter: string = '',
    characterFilter: string = ''
  ) {
    let params = new HttpParams()
      .set('pn', page.toString())
      .set('ps', this.pageSize.toString());

      if (titleFilter) {
        params = params.set('title', titleFilter);
      }
      if (authorFilter) {
        params = params.set('author', authorFilter);
      }
      if (genreFilter) {
        params = params.set('genres', genreFilter);
      }
      if (characterFilter) {
        params = params.set('characters', characterFilter);
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



  postBook(bookData: any) {
    const token = localStorage.getItem('x-access-token');
    const headers = token ? new HttpHeaders().set('x-access-token', token) : new HttpHeaders();

    const formData = new FormData();
    formData.append("title", bookData.title);
    formData.append("series", bookData.series || "");
    formData.append("author", bookData.author);
    formData.append("genres", bookData.genres);
    formData.append("description", bookData.description);
    formData.append("language", bookData.language);
    formData.append("triggers", bookData.triggers);
    formData.append("isbn", bookData.isbn);
    formData.append("characters", bookData.characters);
    formData.append("bookFormat", bookData.bookFormat);
    formData.append("edition", bookData.edition || "");
    formData.append("pages", bookData.pages.toString());
    formData.append("publisher", bookData.publisher || "");
    formData.append("publishDate", bookData.publishDate);
    formData.append("firstPublishDate", bookData.firstPublishDate);
    formData.append("awards", bookData.awards);
    formData.append("coverImg", bookData.coverImg);
    formData.append("price", bookData.price.toString());

    return this.http.post<any>('http://localhost:5000/api/v1.0/add-book', formData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error adding book:', error);
          return throwError(() => new Error('Failed to add book.'));
        })
      );
  }

  updateBook(id: string, bookData: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.put<any>('http://localhost:5000/api/v1.0/books/' + id, bookData, {headers});
  }

  deleteBook(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.delete<any>('http://localhost:5000/api/v1.0/books/' + id, {headers});
  }

  UpdateTriggers(bookId: string, triggers: string[]) {
    const token = localStorage.getItem('x-access-token');
    const headers = token ? new HttpHeaders().set('x-access-token', token) : new HttpHeaders();

    const formData = new FormData();
    triggers.forEach((trigger: string) => formData.append('triggers', trigger));

    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + bookId + '/add-trigger', formData, { headers })
  }


  getRecommendations(page: number, pageSize: number) {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    const token = localStorage.getItem('x-access-token');
    const headers = token ? new HttpHeaders().set('x-access-token', token) : new HttpHeaders();

    return this.http.get<{ recommended_books: any[] }>('http://localhost:5000/api/v1.0/recommendations', { params, headers });
  }

  getTopBooks(
    page: number,
    titleFilter: string = '',
    authorFilter: string = '',
    genreFilter: string = '',
    characterFilter: string = ''
  ) {
    let params = new HttpParams()
      .set('pn', page.toString())
      .set('ps', this.pageSize.toString());

      if (titleFilter) {
        params = params.set('title', titleFilter);
      }
      if (authorFilter) {
        params = params.set('author', authorFilter);
      }
      if (genreFilter) {
        params = params.set('genres', genreFilter);
      }
      if (characterFilter) {
        params = params.set('characters', characterFilter);
      }

    return this.http
      .get<any>('http://localhost:5000/api/v1.0/top-books', { params })
      .pipe(
        catchError((error) => {
          console.error('Error fetching books:', error);
          return throwError(() => new Error('Failed to fetch books.'));
        })
      );
  }

  getNewBooks(
    page: number,
    titleFilter: string = '',
    authorFilter: string = '',
    genreFilter: string = '',
    characterFilter: string = ''
  ) {
    let params = new HttpParams()
      .set('pn', page.toString())
      .set('ps', this.pageSize.toString());

      if (titleFilter) {
        params = params.set('title', titleFilter);
      }
      if (authorFilter) {
        params = params.set('author', authorFilter);
      }
      if (genreFilter) {
        params = params.set('genres', genreFilter);
      }
      if (characterFilter) {
        params = params.set('characters', characterFilter);
      }

    return this.http
      .get<any>('http://localhost:5000/api/v1.0/new-releases', { params })
      .pipe(
        catchError((error) => {
          console.error('Error fetching books:', error);
          return throwError(() => new Error('Failed to fetch books.'));
        })
      );
  }

  markBookAsRead(id: string, rating: number, date_read: any) {
    const token = localStorage.getItem('x-access-token');
    const headers = token ? new HttpHeaders().set('x-access-token', token) : new HttpHeaders();

    const formData = new FormData();
    formData.append("stars", rating.toString());
    formData.append("date_read", date_read);

    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + id + '/have-read', formData, { headers });
  }

  updateReadBook(bookId: string, updateData: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.put<any>('http://localhost:5000/api/v1.0/have-read/' + bookId, updateData, {headers});
  }

  removeBookFromRead(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.delete('http://localhost:5000/api/v1.0/books/' + id + '/have-read', {headers});
  }

  getReadBooks() {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/have-read', { headers });
  }

  getReadBook(bookId: string) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/have-read/' + bookId, { headers });
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
      headers = headers.set('x-access-token', token);
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

  getCurrentRead(bookId: string) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/currently-reading/' + bookId, { headers });
  }

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
      headers = headers.set('x-access-token', token);
    }
    let postData = new FormData();
    postData.append('username', review.username);
    postData.append('title', review.title);
    postData.append('comment', review.comment);
    postData.append('stars', review.stars.toString());
    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + id + '/reviews', postData, {headers})
  }
  getReviews(id: any) {
    return this.http.get<any>('http://localhost:5000/api/v1.0/books/' + id + '/reviews');
  }
  getReview(id: any) {
    return this.http.get<any>('http://localhost:5000/api/v1.0/review/' + id);
  }
  deleteReview(id: any, review: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
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

  reportReview(reviewId: any, reason: string) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    const postData = new FormData();
    postData.append('reason', reason);

    return this.http.post<any>('http://localhost:5000/api/v1.0/review/' + reviewId + '/report', postData, { headers });
  }


  postReviewReply(book_id: any, review_id: any, reply: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    let replyData = new FormData();
    replyData.append('username', reply.username);
    replyData.append('content', reply.content);
    return this.http.post<any>('http://localhost:5000/api/v1.0/books/' + book_id + '/reviews/' + review_id + '/replies', replyData, {headers})
  }

  fetchReviewReplies(book_id: any, review_id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/books/' + book_id + '/reviews/' + review_id + '/replies', { headers });
  }

  deleteReviewReply(book_id: any, review_id: any, reply: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.delete<any>('http://localhost:5000/api/v1.0/books/' + book_id + '/reviews/' + review_id + '/replies/' + reply._id, {headers});
  }

  likeReviewReply(review_id: any, reply: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/review/' + review_id + '/replies/' + reply._id + '/like', {}, {headers});
  }

  dislikeReviewReply(id: any, reply: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/review/' + id + '/replies/' + reply._id + '/dislike', {}, {headers});
  }

  reportReviewReply(reviewId: any, replyId: any, reason: string) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    const postData = new FormData();
    postData.append('reason', reason);

    return this.http.post<any>(`http://localhost:5000/api/v1.0/review/${reviewId}/replies/${replyId}/report`, postData, { headers });
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
      .set('pn', page.toString())
      .set('ps', this.pageSize.toString());

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
      headers = headers.set('x-access-token', token);
    }

    let postData = new FormData();
    postData.append('username', request.username);
    postData.append('title', request.title);
    postData.append('author', request.author);
    postData.append('genres', request.genres);
    postData.append('language', request.language);

    if (request.series) {
      postData.append('series', request.series);
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
    return this.http.post<any>('http://localhost:5000/api/v1.0/requests/'+ id + '/reject', {}, { headers });
  }


//------------------------------------------------------------------------------------------------------------------
// 6. USER THOUGHT CALLS
  postThought(thought: any, page: number) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('x-access-token', token);
    }
    let postData = new FormData();
    postData.append('username', thought.username);
    postData.append('comment', thought.comment);
    return this.http.post<any>('http://localhost:5000/api/v1.0/thoughts', postData, {headers})
  }
  getThoughts() {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/thoughts', {headers});
  }
  getThought(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/thoughts/' + id, { headers });
  }

  deleteThought(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.delete<any>('http://localhost:5000/api/v1.0/thoughts/' + id, {headers});
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

  reportThought(thoughtId: any, reason: string) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    const postData = new FormData();
    postData.append('reason', reason);

    return this.http.post<any>('http://localhost:5000/api/v1.0/thoughts/' + thoughtId + '/report', postData, { headers });
  }

//------------------------------------------------------------------------------------------------------------------
// 7. USER THOUGHT REPLY CALLS
  postReply(id: any, reply: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    let postData = new FormData();
    postData.append('username', reply.username);
    postData.append('content', reply.content);
    return this.http.post<any>('http://localhost:5000/api/v1.0/thoughts/' + id + '/replies', postData, {headers})
  }
  fetchReplies(id: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get<any>('http://localhost:5000/api/v1.0/thoughts/' + id + '/replies', { headers });
  }

  deleteReply(id: any, reply: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.delete<any>('http://localhost:5000/api/v1.0/thoughts/' + id + '/replies/' + reply._id, {headers});
  }

  likeReply(id: any, reply: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/thoughts/' + id + '/replies/' + reply._id + '/like', {}, {headers});
  }

  dislikeReply(id: any, reply: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post<any>('http://localhost:5000/api/v1.0/thoughts/' + id + '/replies/' + reply._id + '/dislike', {}, {headers});
  }

  reportThoughtReply(thoughtId: any, replyId: any, reason: string) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    const postData = new FormData();
    postData.append('reason', reason);

    return this.http.post<any>('http://localhost:5000/api/v1.0/thoughts/' + thoughtId + '/replies/' + replyId + '/report', postData, {headers});
  }

//------------------------------------------------------------------------------------------------------------------
// 8. REPORT CALLS
  getAllReports() {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    return this.http.get<any>('http://localhost:5000/api/v1.0/reports', { headers });
  }

  getOneReport(reportId: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    return this.http.get<any>('http://localhost:5000/api/v1.0/reports/' + reportId, { headers });
  }

  approveReport(reportId: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    return this.http.post<any>('http://localhost:5000/api/v1.0/reports/' + reportId + '/approve', {}, { headers });
  }

  rejectReport(reportId: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    return this.http.post<any>('http://localhost:5000/api/v1.0/reports/' + reportId + '/approve', {}, { headers });
  }

  deleteReport(reportId: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    return this.http.delete<any>(`http://localhost:5000/api/v1.0/reports/${reportId}`, { headers });
  }

//------------------------------------------------------------------------------------------------------------------
// 8. FEEDBACK CALLS
  getAllFeedback() {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    return this.http.get<any>('http://localhost:5000/api/v1.0/user-feedback', { headers });
  }

  getOneFeedback(feedbackId: any) {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }

    return this.http.get<any>('http://localhost:5000/api/v1.0/deleted-accounts/' + feedbackId, { headers });
  }
}


