// import { TestBed } from '@angular/core/testing';
// import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
// import { AuthService } from '../auth/auth.service';
// import { HttpHeaders } from '@angular/common/http';

// describe('AuthService', () => {
//   let service: AuthService;
//   let httpMock: HttpTestingController;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [AuthService]
//     });
//     service = TestBed.inject(AuthService);
//     httpMock = TestBed.inject(HttpTestingController);
//   });

//   afterEach(() => {
//     httpMock.verify();
//   });

//   describe('Auth Service Initialization', () => {
//     it('should be created', () => {
//       expect(service).toBeTruthy();
//     });
//   });

//   describe('Login', () => {
//     it('should make a login request', () => {
//       const username = 'testuser';
//       const password = 'password';
//       const mockResponse = { token: 'fake-jwt-token' };

//       service.login(username, password).subscribe(response => {
//         expect(response).toEqual(mockResponse);
//       });

//       const req = httpMock.expectOne('http://localhost:5000/api/v1.0/login');
//       expect(req.request.method).toBe('GET');
//       expect(req.request.headers.get('Authorization')).toBe(
//         'Basic ' + btoa(username + ':' + password)
//       );
//       req.flush(mockResponse);
//     });

//     it('should handle login errors', () => {
//       const username = 'testuser';
//       const password = 'wrongpassword';
//       const mockError = { status: 401, statusText: 'UNAUTHORISED', error: { message: 'Incorrect Password' } };
//       let errorResponse: any;

//       service.login(username, password).subscribe({
//         next: () => {},
//         error: (error) => {
//           errorResponse = error;
//         }
//       });

//       const req = httpMock.expectOne('http://localhost:5000/api/v1.0/login');
//       req.flush(mockError.error, { status: mockError.status, statusText: mockError.statusText });

//       expect(errorResponse.error.message).toBe('Incorrect Password');
//     });
//   });

//   describe('Token Management', () => {
//     it('should store and retrieve token', () => {
//       service.setToken('fake-token');
//       expect(service.getToken()).toBe('fake-token');
//     });

//     it('should remove token', () => {
//       service.setToken('fake-token');
//       service.removeToken();
//       expect(service.getToken()).toBeNull();
//     });

//     it('should check if user is logged in', () => {
//       service.setToken('fake-token');
//       expect(service.isLoggedIn()).toBeTrue();
//       service.removeToken();
//       expect(service.isLoggedIn()).toBeFalse();
//     });
//   });

//   describe('User Role Checks', () => {
//     it('should check if user is admin', () => {
//       const fakeToken = btoa(JSON.stringify({ admin: true }));
//       localStorage.setItem('x-access-token', `header.${fakeToken}.signature`);
//       expect(service.isAdmin()).toBeTrue();
//     });

//     it('should check if user is an author', () => {
//       const fakeToken = btoa(JSON.stringify({ user_type: 'author' }));
//       localStorage.setItem('x-access-token', `header.${fakeToken}.signature`);
//       expect(service.isAuthor()).toBeTrue();
//     });
//   });

//   describe('Signup', () => {
//     it('should make a signup request', () => {
//       const userData = {
//         name: 'Test User',
//         username: 'testuser',
//         pronouns: 'he\him',
//         password: 'password',
//         email: 'test@example.com',
//         user_type: 'reader',
//         favourite_genres: 'fiction',
//         favourite_authors: 'Author Name',
//         admin: false
//       };
//       const mockResponse = { message: 'User created successfully' };

//       service.signup(
//         userData.name,
//         userData.username,
//         userData.pronouns,
//         userData.password,
//         userData.email,
//         userData.user_type,
//         userData.favourite_genres,
//         userData.favourite_authors,
//         userData.admin
//       ).subscribe(response => {
//         expect(response).toEqual(mockResponse);
//       });

//       const req = httpMock.expectOne('http://localhost:5000/api/v1.0/signup');
//       expect(req.request.method).toBe('POST');
//       req.flush(mockResponse);
//     });

//     it('should handle signup errors', () => {
//       const userData = {
//         name: 'Test User',
//         username: 'testuser',
//         pronouns: 'he\him',
//         password: 'password',
//         email: 'test@example.com',
//         user_type: 'reader',
//         favourite_genres: 'fiction',
//         favourite_authors: 'Author Name',
//         admin: false
//       };

//       const mockError = { status: 400, statusText: 'Bad Request', error: { message: 'Username already taken' } };
//       let errorResponse: any;

//       service.signup(
//         userData.name,
//         userData.username,
//         userData.pronouns,
//         userData.password,
//         userData.email,
//         userData.user_type,
//         userData.favourite_genres,
//         userData.favourite_authors,
//         userData.admin
//       ).subscribe({
//         next: () => {},
//         error: (error) => {
//           errorResponse = error;
//         }
//       });

//       const req = httpMock.expectOne('http://localhost:5000/api/v1.0/signup');
//       req.flush(mockError.error, { status: mockError.status, statusText: mockError.statusText });

//       expect(errorResponse.error.message).toBe('Username already taken');
//     });
//   });

//   describe('Logout', () => {
//     it('should make a logout request and remove token', () => {
//       const token = 'fake-token';
//       service.setToken(token);

//       service.logout(token).subscribe(response => {
//         expect(response).toEqual({ message: 'Logged out successfully' });
//       });

//       const req = httpMock.expectOne('http://localhost:5000/api/v1.0/logout');
//       expect(req.request.method).toBe('GET');
//       expect(req.request.headers.get('x-access-token')).toBe(token);

//       req.flush({ message: 'Logged out successfully' });

//       service.removeToken();
//       expect(service.getToken()).toBeNull();
//     });
//   });

//   describe('Suspend User', () => {
//     it('should suspend the user and prevent login', () => {
//       const userId = '12345';
//       const mockResponse = { message: 'User suspended successfully' };

//       // Simulate the suspension action
//       service.suspendUser(userId).subscribe(response => {
//         expect(response).toEqual(mockResponse);
//       });

//       const req = httpMock.expectOne('http://localhost:5000/api/v1.0/users/12345/suspend');
//       expect(req.request.method).toBe('POST');
//       req.flush(mockResponse);

//       // Simulate the suspended user trying to log in
//       const mockLoginError = { status: 403, statusText: 'Forbidden', error: { message: 'Your account is suspended' } };
//       service.login('suspendeduser', 'password').subscribe({
//         next: () => {},
//         error: (error) => {
//           expect(error.error.message).toBe('Your account is suspended');
//         }
//       });

//       const loginReq = httpMock.expectOne('http://localhost:5000/api/v1.0/login');
//       loginReq.flush(mockLoginError.error, { status: mockLoginError.status, statusText: mockLoginError.statusText });
//     });
//   });

//   // Testing banUser
//   describe('Ban User', () => {
//     it('should ban the user and prevent signup', () => {
//       const userId = '12345';
//       const mockResponse = { message: 'User banned successfully' };

//       // Simulate the ban action
//       service.banUser(userId).subscribe(response => {
//         expect(response).toEqual(mockResponse);
//       });

//       const req = httpMock.expectOne('http://localhost:5000/api/v1.0/users/12345/ban');
//       expect(req.request.method).toBe('POST');
//       req.flush(mockResponse);

//       // Simulate the banned user trying to sign up
//       const mockSignupError = { status: 403, statusText: 'Forbidden', error: { message: 'Your account is banned' } };
//       const userData = {
//         name: 'Banned User',
//         username: 'banneduser',
//         password: 'password',
//         email: 'banned@example.com'
//       };

//       service.signup(
//         userData.name,
//         userData.username,
//         'he/him',
//         userData.password,
//         userData.email,
//         'reader',
//         'fiction',
//         'Author Name',
//         false
//       ).subscribe({
//         next: () => {},
//         error: (error) => {
//           expect(error.error.message).toBe('Your account is banned');
//         }
//       });

//       const signupReq = httpMock.expectOne('http://localhost:5000/api/v1.0/signup');
//       signupReq.flush(mockSignupError.error, { status: mockSignupError.status, statusText: mockSignupError.statusText });
//     });
//   });

//   describe('Decoded Token', () => {
//     it('should decode the token', () => {
//       // Use valid base64-encoded token parts
//       const fakePayload = { username: 'testuser', admin: true };
//       const fakePayloadBase64 = btoa(JSON.stringify(fakePayload));

//       // Construct the mock token in proper format (header.payload.signature)
//       const mockToken = `header.${fakePayloadBase64}.signature`;

//       localStorage.setItem('x-access-token', mockToken);

//       const decodedToken = service.getDecodedToken();
//       expect(decodedToken.username).toBe(fakePayload.username);
//       expect(decodedToken.admin).toBe(fakePayload.admin);
//     });

//     it('should return null if no token exists', () => {
//       localStorage.removeItem('x-access-token');
//       expect(service.getDecodedToken()).toBeNull();
//     });
//   });


//   // Testing getLoggedInName
//   describe('Get Logged-In User Name', () => {
//     it('should get the logged-in username from the token', () => {
//       // Create a mock payload with username and other properties
//       const mockPayload = { username: 'testuser' };
//       const encodedPayload = btoa(JSON.stringify(mockPayload)); // Base64 encode the payload

//       // Create a mock JWT token (header.payload.signature)
//       const mockToken = `header.${encodedPayload}.signature`;

//       // Set the token in localStorage
//       localStorage.setItem('x-access-token', mockToken);

//       // Call the service method to get the logged-in name
//       const loggedInName = service.getLoggedInName();

//       // Assert that the logged-in name matches the username from the token
//       expect(loggedInName).toBe(mockPayload.username);
//     });

//     it('should return empty string if no token exists', () => {
//       localStorage.removeItem('x-access-token');
//       expect(service.getLoggedInName()).toBe('');
//     });
//   });


//   // Testing isLoggedIn
//   describe('Is Logged In', () => {
//     it('should return true if user is logged in (token exists)', () => {
//       localStorage.setItem('x-access-token', 'fake-token');
//       expect(service.isLoggedIn()).toBeTrue();
//     });

//     it('should return false if user is not logged in (no token)', () => {
//       localStorage.removeItem('x-access-token');
//       expect(service.isLoggedIn()).toBeFalse();
//     });
//   });

//   // Testing isAdmin
//   describe('Is Admin', () => {
//     it('should return true if the user is an admin', () => {
//       const fakeToken = btoa(JSON.stringify({ admin: true }));
//       localStorage.setItem('x-access-token', `header.${fakeToken}.signature`);
//       expect(service.isAdmin()).toBeTrue();
//     });

//     it('should return false if the user is not an admin', () => {
//       const fakeToken = btoa(JSON.stringify({ admin: false }));
//       localStorage.setItem('x-access-token', `header.${fakeToken}.signature`);
//       expect(service.isAdmin()).toBeFalse();
//     });

//     it('should return false if there is no token', () => {
//       localStorage.removeItem('x-access-token');
//       expect(service.isAdmin()).toBeFalse();
//     });
//   });

//   // Testing isAuthor
//   describe('Is Author', () => {
//     it('should return true if the user is an author', () => {
//       const fakeToken = btoa(JSON.stringify({ user_type: 'author' }));
//       localStorage.setItem('x-access-token', `header.${fakeToken}.signature`);
//       expect(service.isAuthor()).toBeTrue();
//     });

//     it('should return false if the user is not an author', () => {
//       const fakeToken = btoa(JSON.stringify({ user_type: 'reader' }));
//       localStorage.setItem('x-access-token', `header.${fakeToken}.signature`);
//       expect(service.isAuthor()).toBeFalse();
//     });

//     it('should return false if there is no token', () => {
//       localStorage.removeItem('x-access-token');
//       expect(service.isAuthor()).toBeFalse();
//     });
//   });

//   // Testing deleteAccount
//   describe('Delete Account', () => {
//     it('should delete the account with a reason', () => {
//       const mockResponse = { message: 'Account deleted successfully' };
//       const reason = 'User requested account deletion';

//       service.deleteAccount(reason).subscribe(response => {
//         expect(response).toEqual(mockResponse);
//       });

//       const req = httpMock.expectOne('http://localhost:5000/api/v1.0/delete-account');
//       expect(req.request.method).toBe('DELETE');
//       expect(req.request.body.get('reason')).toBe(reason);
//       req.flush(mockResponse);
//     });

//     it('should delete the account without a reason', () => {
//       const mockResponse = { message: 'Account deleted successfully' };

//       service.deleteAccount().subscribe(response => {
//         expect(response).toEqual(mockResponse);
//       });

//       const req = httpMock.expectOne('http://localhost:5000/api/v1.0/delete-account');
//       expect(req.request.method).toBe('DELETE');
//       req.flush(mockResponse);
//     });
//   });

// });
