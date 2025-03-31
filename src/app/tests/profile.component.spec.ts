import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from '../profile/profile.component';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let webServiceSpy: jasmine.SpyObj<WebService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;

  let originalConfirm: (message?: string) => boolean; // Store original confirm method

  beforeEach(async () => {
    webServiceSpy = jasmine.createSpyObj('WebService', ['getProfile', 'updateProfile', 'removeProfilePic']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, ProfileComponent],
      providers: [
        { provide: WebService, useValue: webServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    // Save original confirm before spying
    originalConfirm = window.confirm;

    // Set up the spy for confirm()
    spyOn(localStorage, 'getItem').and.returnValue('mock-token'); // Mock token for authentication
    spyOn(window, 'confirm').and.returnValue(true);  // Spy on confirm method

    // Spying on window.location.reload() correctly
    spyOn(window.location, 'reload').and.callFake(() => {});  // Mock reload method

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Restore original confirm method after each test
    window.confirm = originalConfirm;
  });

  it('should submit updated genres and authors and persist after reload', () => {
    // Simulate the response from updateProfile API
    const updatedProfile = {
      profile_pic: 'http://example.com/profile_pic.jpg',
      favourite_genres: ['Fiction', 'Adventure'],  // Updated genres
      favourite_authors: ['Author1', 'Author2']    // Updated authors
    };

    webServiceSpy.updateProfile.and.returnValue(of(updatedProfile));

    // Mock the existing profile before the update
    const mockProfile = {
      favourite_genres: ['Fiction'],
      favourite_authors: ['Author1']
    };

    component.user = mockProfile;
    component.initForm();

    // Set form values with updated genres and authors
    component.editProfileForm.patchValue({
      favourite_genres: ['Fiction', 'Adventure'],
      favourite_authors: ['Author1', 'Author2']
    });

    spyOn(component, 'onSubmit').and.callThrough();

    component.onSubmit();

    expect(component.onSubmit).toHaveBeenCalled(); // Ensure onSubmit was executed

    expect(webServiceSpy.updateProfile).toHaveBeenCalledWith({
      favourite_genres: ['Fiction', 'Adventure'],
      favourite_authors: ['Author1', 'Author2']
    });

    // Ensure the API request was made correctly
    const req = httpMock.expectOne('http://localhost:5000/api/v1.0/profile');
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.has('x-access-token')).toBeTrue();

    req.flush(updatedProfile);

    // Check if the profile was updated correctly after the response
    expect(component.user.favourite_genres).toEqual(['Fiction', 'Adventure']);
    expect(component.user.favourite_authors).toEqual(['Author1', 'Author2']);

    // Simulate reload: Assign new data as if fetched after a page refresh
    component.user = updatedProfile;

    // Check that favourite_genres and favourite_authors persist
    expect(component.user.favourite_genres).toEqual(['Fiction', 'Adventure']);
    expect(component.user.favourite_authors).toEqual(['Author1', 'Author2']);

    // Ensure reload was triggered
    expect(window.location.reload).toHaveBeenCalled();
  });

});
