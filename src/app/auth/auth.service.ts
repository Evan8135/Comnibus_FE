import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class AuthService {

  constructor(private http: HttpClient) {}

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
      headers = headers.set('x-access-token', token); // Pass the token in x-access-token header
    }
    return this.http.get('http://localhost:5000/api/v1.0/users', { headers });
  }

  getUser(userId: string): Observable<any> {
    return this.http.get('http://localhost:5000/api/v1.0/users/' + userId);
  }

  banUser(userId: string): Observable<any> {
    const token = localStorage.getItem('x-access-token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('x-access-token', token); // Pass the token in x-access-token header
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

  isReviewOwner(reviewUsername: string): boolean {
    return this.getLoggedInName() === reviewUsername;
  }

}
