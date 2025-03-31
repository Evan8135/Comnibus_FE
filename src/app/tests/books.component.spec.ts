import { TestBed } from '@angular/core/testing';
import { BooksComponent } from '../books/books.component';
import { RouterTestingModule } from '@angular/router/testing';
import { WebService } from '../web.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';


describe('BooksComponent', () => {
  let webServiceSpy: jasmine.SpyObj<WebService>;
  let activatedRouteSpy: any;

  beforeEach(async () => {
    webServiceSpy = jasmine.createSpyObj('WebService', ['getBooks']);
    webServiceSpy.getBooks.and.returnValue(of([])); // Mock empty books list

    activatedRouteSpy = {
      queryParams: of({ title: 'Test Title', genre: 'Fiction', author: 'Test Author' })
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule, BooksComponent],
      providers: [
        { provide: WebService, useValue: webServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();
  });

  it('should create the BooksComponent', () => {
    const fixture = TestBed.createComponent(BooksComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should initialize filters from query params', () => {
    const fixture = TestBed.createComponent(BooksComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.titleFilter).toBe('Test Title');
    expect(component.genreFilter).toBe('Fiction');
    expect(component.authorFilter).toBe('Test Author');
  });

  it('should call fetchBooks on init', () => {
    const fixture = TestBed.createComponent(BooksComponent);
    const component = fixture.componentInstance;
    spyOn(component, 'fetchBooks');
    fixture.detectChanges();
    expect(component.fetchBooks).toHaveBeenCalled();
  });

  it('should filter NSFW books correctly', () => {
    const fixture = TestBed.createComponent(BooksComponent);
    const component = fixture.componentInstance;
    const book = { genres: ['erotic'] }; // Ensure lowercase to match method logic
    expect(component.isNSFW(book)).toBeTrue();
  });
});
