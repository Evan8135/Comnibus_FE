import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfileComponent } from '../profile/profile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { WebService } from '../web.service';
import { of } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let webServiceSpy: jasmine.SpyObj<WebService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    // Mocking the WebService
    const webServiceMock = jasmine.createSpyObj('WebService', ['updateProfile']);

    // Example of updated profile data
    const updatedProfile = {
      username: 'testuser',
      email: 'test@example.com',
      profile_pic: 'http://example.com/profile_pic.jpg',
      favourite_genres: ['Fiction', 'Adventure'],
      favourite_authors: ['Author1', 'Author2']
    };

    // Return mock updated profile
    webServiceMock.updateProfile.and.returnValue(of(updatedProfile));

    // Set up the TestBed with the standalone component and the necessary services
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, ProfileComponent],  // Standalone Component added to imports
      providers: [
        { provide: WebService, useValue: webServiceMock }
      ]
    }).compileComponents();

    // Create the component fixture and inject dependencies
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    webServiceSpy = TestBed.inject(WebService) as jasmine.SpyObj<WebService>;
    httpMock = TestBed.inject(HttpTestingController);

    // Initial user data mock
    component.user = {
      username: 'testuser',
      email: 'test@example.com',
      favourite_genres: ['Fiction'],
      favourite_authors: ['Author1'],
      profile_pic: 'http://example.com/profile_pic.jpg'
    };

    // Initialize form and trigger change detection
    component.initForm();
    fixture.detectChanges();
  });

  afterEach(() => {
    // Verify no pending HTTP requests after each test
    httpMock.verify();
  });

  it('should create the ProfileComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', () => {
    const formValue = component.editProfileForm.value;
    expect(formValue.username).toBe('testuser');
    expect(formValue.email).toBe('test@example.com');
    expect(formValue.favourite_genres).toEqual(['Fiction']);
    expect(formValue.favourite_authors).toEqual(['Author1']);
  });

  it('should submit updated profile and update user data', fakeAsync(() => {
    const updatedProfile = {
      username: 'testuser',
      email: 'test@example.com',
      profile_pic: 'http://example.com/profile_pic.jpg',
      favourite_genres: ['Fiction'],
      favourite_authors: ['Author1', 'Author2']
    };

    // Update form with new profile data
    component.editProfileForm.patchValue({
      username: 'testuser',
      email: 'test@example.com',
      favourite_genres: ['Fiction'],
      favourite_authors: ['Author1', 'Author2']
    });

    // Mark form as touched and update validity
    component.editProfileForm.markAllAsTouched();
    component.editProfileForm.updateValueAndValidity();

    // Submit the form
    component.onSubmit();

    // Assert that WebService's updateProfile method was called with the correct data
    expect(webServiceSpy.updateProfile).toHaveBeenCalledWith(jasmine.objectContaining({
      username: 'testuser',
      email: 'test@example.com',
      favourite_genres: ['Fiction'],
      favourite_authors: ['Author1', 'Author2']
    }));

    // Ensure the HTTP request was made as expected
    // const req = httpMock.expectOne('http://localhost:5000/api/v1.0/profile');
    // expect(req.request.method).toBe('PUT');
    // expect(req.request.headers.has('x-access-token')).toBeTrue();
    // req.flush(updatedProfile);

    // Assert that the component's user object has been updated
    expect(component.user.favourite_genres).toEqual(['Fiction']);
    expect(component.user.favourite_authors).toEqual(['Author1', 'Author2']);
  }));
});
