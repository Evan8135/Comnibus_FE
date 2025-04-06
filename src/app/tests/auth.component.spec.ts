import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { HttpHeaders } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a login request', () => {
    const username = 'testuser';
    const password = 'password';
    const mockResponse = { token: 'fake-jwt-token' };

    service.login(username, password).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/v1.0/login');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      'Basic ' + btoa(username + ':' + password)
    );
    req.flush(mockResponse);
  });

  it('should handle login errors', () => {
    const username = 'testuser';
    const password = 'wrongpassword';
    const mockError = { status: 401, statusText: 'UNAUTHORISED', error: { message: 'Incorrect Password' } };
    let errorResponse: any;

    service.login(username, password).subscribe({
      next: () => {},
      error: (error) => {
        errorResponse = error;
      }
    });

    const req = httpMock.expectOne('http://localhost:5000/api/v1.0/login');
    req.flush(mockError.error, { status: mockError.status, statusText: mockError.statusText });

    expect(errorResponse.error.message).toBe('Incorrect Password');
  });

  it('should store and retrieve token', () => {
    service.setToken('fake-token');
    expect(service.getToken()).toBe('fake-token');
  });

  it('should remove token', () => {
    service.setToken('fake-token');
    service.removeToken();
    expect(service.getToken()).toBeNull();
  });

  it('should check if user is logged in', () => {
    service.setToken('fake-token');
    expect(service.isLoggedIn()).toBeTrue();
    service.removeToken();
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should check if user is admin', () => {
    const fakeToken = btoa(JSON.stringify({ admin: true }));
    localStorage.setItem('x-access-token', `header.${fakeToken}.signature`);
    expect(service.isAdmin()).toBeTrue();
  });

  it('should check if user is an author', () => {
    const fakeToken = btoa(JSON.stringify({ user_type: 'author' }));
    localStorage.setItem('x-access-token', `header.${fakeToken}.signature`);
    expect(service.isAuthor()).toBeTrue();
  });

  it('should make a signup request', () => {
    const userData = {
      name: 'Test User',
      username: 'testuser',
      pronouns: 'he\him',
      password: 'password',
      email: 'test@example.com',
      user_type: 'reader',
      favourite_genres: 'fiction',
      favourite_authors: 'Author Name',
      admin: false
    };
    const mockResponse = { message: 'User created successfully' };

    service.signup(
      userData.name,
      userData.username,
      userData.pronouns,
      userData.password,
      userData.email,
      userData.user_type,
      userData.favourite_genres,
      userData.favourite_authors,
      userData.admin
    ).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:5000/api/v1.0/signup');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should handle signup errors', () => {
    const userData = {
      name: 'Test User',
      username: 'testuser',
      pronouns: 'he\him',
      password: 'password',
      email: 'test@example.com',
      user_type: 'reader',
      favourite_genres: 'fiction',
      favourite_authors: 'Author Name',
      admin: false
    };

    const mockError = { status: 400, statusText: 'Bad Request', error: { message: 'Username already taken' } };
    let errorResponse: any;

    service.signup(
      userData.name,
      userData.username,
      userData.pronouns,
      userData.password,
      userData.email,
      userData.user_type,
      userData.favourite_genres,
      userData.favourite_authors,
      userData.admin
    ).subscribe({
      next: () => {},
      error: (error) => {
        errorResponse = error;
      }
    });

    const req = httpMock.expectOne('http://localhost:5000/api/v1.0/signup');
    req.flush(mockError.error, { status: mockError.status, statusText: mockError.statusText });

    expect(errorResponse.error.message).toBe('Username already taken');
  });

  it('should make a logout request and remove token', () => {
    const token = 'fake-token';
    service.setToken(token);

    service.logout(token).subscribe(response => {
      expect(response).toEqual({ message: 'Logged out successfully' });
    });

    const req = httpMock.expectOne('http://localhost:5000/api/v1.0/logout');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('x-access-token')).toBe(token);

    req.flush({ message: 'Logged out successfully' });

    service.removeToken();
    expect(service.getToken()).toBeNull();
  });


});
