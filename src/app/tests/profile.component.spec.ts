import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfileComponent } from '../profile/profile.component'; // Import ProfileComponent
import { WebService } from '../web.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let webService: WebService;
  let formBuilder: FormBuilder;

  beforeEach(waitForAsync(() => {
    // Mock ActivatedRoute
    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: (key: string) => 'mocked-value', // Mocked return for route parameters
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule, // Use RouterTestingModule for routing features
      ],
      providers: [
        FormBuilder,
        WebService,
        { provide: ActivatedRoute, useValue: activatedRouteMock } // Mock ActivatedRoute
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      webService = TestBed.inject(WebService);
      formBuilder = TestBed.inject(FormBuilder);

      // Initialize the form
      component.editProfileForm = formBuilder.group({
        username: [''],
        email: [''],
        favourite_genres: [[]],
        favourite_authors: [[]],
        profile_pic: ['']
      });

      fixture.detectChanges(); // Ensure changes are detected
    });
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with user data', () => {
    component.user = {
      username: 'testuser',
      email: 'test@example.com',
      favourite_genres: ['Fiction'],
      favourite_authors: ['Author1'],
      profile_pic: 'http://example.com/profile_pic.jpg'
    };
    component.initForm(); // Initialize the form with user data
    fixture.detectChanges();

    const formValue = component.editProfileForm.value;
    expect(formValue.username).toBe('testuser');
    expect(formValue.email).toBe('test@example.com');
    expect(formValue.favourite_genres).toEqual(['Fiction']);
    expect(formValue.favourite_authors).toEqual(['Author1']);
  });

  it('should submit updated profile after confirmation', waitForAsync(() => {
    const updatedProfile = {
      username: 'testuser',
      email: 'test@example.com',
      profile_pic: 'http://example.com/profile_pic2.jpg',
      favourite_genres: ['Fiction'],
      favourite_authors: ['Author1']
    };

    component.editProfileForm.patchValue(updatedProfile);

    // Spy on the confirm() method to simulate user behavior
    spyOn(window, 'confirm').and.returnValue(true); // Simulate user clicking "OK"

    // Spy on the updateProfile method to mock the response
    spyOn(webService, 'updateProfile').and.returnValue(of(updatedProfile));

    // Call the onSubmit method, which will trigger confirm()
    component.onSubmit();

    // Ensure the confirm dialog was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to update your profile?');

    // Ensure the updateProfile API was called with the correct data
    expect(webService.updateProfile).toHaveBeenCalledWith(updatedProfile);
    expect(component.user.username).toBe('testuser');
    expect(component.user.email).toBe('test@example.com');
  }));

  it('should not submit updated profile if user cancels confirmation', waitForAsync(() => {
    const updatedProfile = {
      username: 'testuser',
      email: 'test@example.com',
      profile_pic: 'http://example.com/profile_pic.jpg',
      favourite_genres: ['Fiction'],
      favourite_authors: ['Author1', 'Author2']
    };

    component.editProfileForm.patchValue(updatedProfile);

    // Spy on the confirm() method to simulate user behavior
    spyOn(window, 'confirm').and.returnValue(false); // Simulate user clicking "Cancel"

    // Spy on the updateProfile method to mock the response
    spyOn(webService, 'updateProfile').and.returnValue(of(updatedProfile));

    // Call the onSubmit method, which will trigger confirm()
    component.onSubmit();

    // Ensure the confirm dialog was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to update your profile?');

    // Ensure updateProfile was not called since the user clicked "Cancel"
    expect(webService.updateProfile).not.toHaveBeenCalled();
  }));
});
