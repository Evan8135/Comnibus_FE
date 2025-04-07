import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReviewsComponent } from '../reviews/reviews.component';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

describe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;
  let webService: WebService;
  let authService: AuthService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        CommonModule,
        ReactiveFormsModule
      ],
      providers: [WebService, AuthService]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(ReviewsComponent);
      component = fixture.componentInstance;
      webService = TestBed.inject(WebService);
      authService = TestBed.inject(AuthService);

      fixture.detectChanges();
    });
  }));

  // 1. Create Component
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 3. Redirect to Login if Not Logged In
  it('should redirect to login if user is not logged in when trying to write a review', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(false);
    spyOn(component['router'], 'navigate');

    component.handleWriteReviewClick();

    expect(component['router'].navigate).toHaveBeenCalledWith(['/login']);
  });

  // 6. Allow Logged In Users to Add a Review
  it('should allow logged in user to add a review', waitForAsync(() => {
    spyOn(authService, 'isLoggedIn').and.returnValue(true);

    const mockReview = { username: 'Test User', title: 'Great Book', content: 'Amazing content!', stars: 5 };
    spyOn(webService, 'postReview').and.returnValue(of({ message: 'Review submitted successfully!' }));
    spyOn(component, 'fetchReviews');

    component.reviewForm.setValue({
      username: 'Test User',
      title: 'Great Book',
      comment: 'Amazing content!',
      stars: 5
    });

    component.onSubmit();

    fixture.whenStable().then(() => {
      expect(component.fetchReviews).toHaveBeenCalled();
    });
  }));
});
