import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReviewComponent } from '../review/review.component';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;
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
      fixture = TestBed.createComponent(ReviewComponent);
      component = fixture.componentInstance;
      webService = TestBed.inject(WebService);
      authService = TestBed.inject(AuthService);

      fixture.detectChanges();
    });
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the review on ngOnInit', waitForAsync(() => {
    const mockReview = { title: 'Test Book', content: 'Great book!', stars: 5 };

    spyOn(webService, 'getReview').and.returnValue(of(mockReview));

    component.ngOnInit();

    fixture.whenStable().then(() => {
      expect(component.reviews).toEqual([mockReview]);
    });
  }));

  it('should show error message when failing to load review', waitForAsync(() => {
    spyOn(webService, 'getReview').and.returnValue(throwError('Error loading review'));

    component.ngOnInit();

    fixture.whenStable().then(() => {
      expect(component.errorMessage).toBe('Failed to load review.');
    });
  }));

  it('should submit a reply correctly', waitForAsync(() => {
    const mockReview = { _id: '1', title: 'Test Book', content: 'Great book!' };
    const mockReply = { username: 'Test User', content: 'Great reply!' };

    spyOn(webService, 'postReviewReply').and.returnValue(of({ message: 'Reply posted successfully!' }));
    spyOn(component, 'fetchReplies');

    component.reviews = [mockReview];
    component.newReplyContent = 'Great reply!';

    component.submitReply(mockReview);

    fixture.whenStable().then(() => {
      expect(webService.postReviewReply).toHaveBeenCalledWith('1', '1', mockReply);
      expect(component.fetchReplies).toHaveBeenCalledWith(mockReview._id, mockReview._id);
    });
  }));

  it('should show error message if reply is empty', () => {
    const mockReview = { _id: '1', title: 'Test Book', content: 'Great book!' };
    component.reviews = [mockReview];
    component.newReplyContent = '';

    component.submitReply(mockReview);

    expect(component.errorMessage).toBe('Reply content cannot be empty!');
  });
});
