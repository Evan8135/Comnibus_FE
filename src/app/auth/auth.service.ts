import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class AuthService {

  constructor(private http: HttpClient) {}

  signup(
    name: string,
    username: string,
    pronouns: string,
    password: string,
    email: string,
    user_type: string,
    favourite_genres?: string,
    favourite_authors?: string,
    admin: boolean = false
  ) {
    const body = new FormData();
    body.append('name', name);
    body.append('username', username);
    body.append('pronouns', pronouns);
    body.append('password', password);
    body.append('email', email);
    body.append('user_type', user_type);
    body.append('admin', admin.toString());

    if (favourite_genres) {
      body.append('favourite_genres', favourite_genres);
    }
    if (favourite_authors) {
      body.append('favourite_authors', favourite_authors);
    }

    return this.http.post('http://localhost:5000/api/v1.0/signup', body);
  }


  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(username + ':' + password)
    });
    return this.http.get('http://localhost:5000/api/v1.0/login', { headers });
  }

  logout(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'x-access-token': token
    });
    return this.http.get('http://localhost:5000/api/v1.0/logout', { headers });
  }

  setToken(token: string): void {
    localStorage.setItem('x-access-token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('x-access-token');
  }

  removeToken(): void {
    localStorage.removeItem('x-access-token');
  }

  getUsers(): Observable<any> {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get('http://localhost:5000/api/v1.0/users', { headers });
  }

  getUser(userId: string): Observable<any> {
    return this.http.get('http://localhost:5000/api/v1.0/users/' + userId);
  }

  suspendUser(userId: string): Observable<any> {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post('http://localhost:5000/api/v1.0/users/' + userId + '/suspend', {}, {headers});
  }

  banUser(userId: string): Observable<any> {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.post('http://localhost:5000/api/v1.0/users/' + userId + '/ban', {}, {headers});
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null; // User is logged in if the token exists
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false; // Not logged in means not an admin

    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
    return payload && payload.admin === true; // Check if the admin flag is true in the payload
  }

  isAuthor(): boolean {
    const token = this.getToken();
    if (!token) return false; // Not logged in means not an admin

    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
    return payload && payload.user_type === 'author'; // Check if the user_type is "author"
  }



  getDecodedToken(): any {
    const token = localStorage.getItem('x-access-token'); // Or wherever your token is stored
    if (!token) {
      return null;
    }
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  getLoggedInName(): string {
    const token = localStorage.getItem('x-access-token'); // Ensure the token is stored here
    console.log('Token:', token);
    if (token) {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.username || ''; // Ensure "name" is part of the payload
    }
    return '';

  }

  getAuthorName(): string {
    const token = localStorage.getItem('x-access-token'); // Ensure the token is stored here
    console.log('Token:', token);
    if (token) {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.name || ''; // Ensure "name" is part of the payload
    }
    return '';

  }

  getFollowers(): string {
    const token = localStorage.getItem('x-access-token'); // Ensure the token is stored here
    console.log('Token:', token);
    if (token) {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.followers || ''; // Ensure "name" is part of the payload
    }
    return '';

  }

  isReviewOwner(reviewUsername: string): boolean {
    return this.getLoggedInName() === reviewUsername;
  }

  isThoughtOwner(thoughtUsername: string): boolean {
    return this.getLoggedInName() === thoughtUsername;
  }

  getUserHaveRead(userId: any): Observable<any> {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get('http://localhost:5000/api/v1.0/profile' + userId + '/have_read', { headers });
  }

  getUserCurrentRead(userId: any): Observable<any> {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token);
    }
    return this.http.get('http://localhost:5000/api/v1.0/profile' + userId + '/currently-reading', { headers });
  }

  deleteAccount(reason?: string): Observable<any> {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token); // Pass the token in x-access-token header
    }

    const body = new FormData();
    if (reason) {
      body.append('reason', reason);
    }

    return this.http.delete('http://localhost:5000/api/v1.0/delete-account', { headers, body });
  }

}
