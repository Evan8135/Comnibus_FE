import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BookComponent } from '../book/book.component';  // Import BookComponent
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('BookComponent', () => {
  let component: BookComponent;
  let fixture: ComponentFixture<BookComponent>;
  let webService: WebService;
  let authService: AuthService;
  let formBuilder: FormBuilder;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        FormBuilder,
        WebService,
        AuthService,
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(BookComponent);
      component = fixture.componentInstance;
      webService = TestBed.inject(WebService);
      authService = TestBed.inject(AuthService);
      formBuilder = TestBed.inject(FormBuilder);

      // Initialize the forms
      component.editBookFormTitle = formBuilder.group({
        title: ['']
      });

      component.rateForm = formBuilder.group({
        stars: [null],
        date_read: ['']
      });

      component.triggerForm = formBuilder.group({
        triggers: ['']
      });

      fixture.detectChanges(); // Ensure changes are detected
    });
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should add triggers correctly', waitForAsync(() => {
    const mockTriggers = ['Trigger 1'];

    // Initialize book with empty triggers array
    component.book = { _id: '1', title: 'Test Book', triggers: [] };

    // Set value for triggers in the form
    component.triggerForm.setValue({ triggers: 'Trigger 1' });  // Set as a string for splitting

    // spyOn(window, 'confirm').and.callFake((message?: string) => {
    //   if (message) {
    //     expect(message).toBe('Triggers added successfully!');
    //   }
    //   return true;  // Simulate the user clicking "OK"
    // });

    // Spy on the UpdateTriggers API method to mock the response
    spyOn(webService, 'UpdateTriggers').and.returnValue(of({ message: 'Triggers updated successfully!' }));

    // Call the addTriggers method to simulate adding triggers
    component.addTriggers();
    // Ensure the form was hidden after the trigger is added
    expect(component.showTriggerForm).toBeFalse();

  }));


  it('should not allow non-authors to edit the title', waitForAsync(() => {
    spyOn(authService, 'isLoggedIn').and.returnValue(true);  // Make sure user is logged in
    spyOn(authService, 'getLoggedInName').and.returnValue('Not');  // Simulate a non-author logged in


    component.book = { _id: '1', title: 'Test Book', author: ['Test Author'] };

    fixture.detectChanges(); // Trigger ngOnInit

    fixture.whenStable().then(() => {
      component.toggleEditTitle();  // Try toggling edit title for a non-author
      expect(component.isEditingTitle).toBeFalse();  // Non-authors should not be able to edit the title
    });
  }));
});
