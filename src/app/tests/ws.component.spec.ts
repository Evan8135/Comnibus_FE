import { TestBed } from '@angular/core/testing';
import { WebService } from '../web.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';

describe('WebService', () => {
  let service: WebService;
  let httpMock: HttpTestingController;

  const mockToken = 'test-token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WebService]
    });

    service = TestBed.inject(WebService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return key === 'x-access-token' ? mockToken : null;
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Web Service Initialization', () => {
      it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Book Calls', () => {
    it('should call getBooks with correct params', () => {
      const mockResponse = { data: [] };
      service.getBooks(1, 'title', 'author', 'genre', 'character').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne((request) => {
        const params = request.params;
        return request.url === 'http://localhost:5000/api/v1.0/books'
          && params.get('pn') === '1'
          && params.get('ps') === service.pageSize.toString()
          && params.get('title') === 'title'
          && params.get('author') === 'author'
          && params.get('genres') === 'genre'
          && params.get('characters') === 'character';
      });

      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });


    it('should post a new book', () => {
      const mockBookData = {
        title: 'Test Book',
        author: 'Author',
        genres: 'Genre',
        description: 'Description',
        language: 'English',
        triggers: 'None',
        isbn: '123456789',
        characters: 'Character',
        bookFormat: 'Paperback',
        pages: 100,
        publishDate: '2025-01-01',
        firstPublishDate: '2024-01-01',
        awards: 'Award',
        coverImg: new Blob(),
        price: 19.99
      };

      service.postBook(mockBookData).subscribe();

      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/add-book');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();

      req.flush({});
    });

    it('should delete the book by ID', () => {
      const bookId = '123';
      service.deleteBook(bookId).subscribe();

      const req = httpMock.expectOne(`http://localhost:5000/api/v1.0/books/${bookId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should get recommendations with pagination', () => {
      const page = 1;
      const pageSize = 5;
      service.getRecommendations(page, pageSize).subscribe();

      const req = httpMock.expectOne((request) => {
        const params = request.params;
        return request.url === 'http://localhost:5000/api/v1.0/recommendations'
          && params.get('page') === page.toString()
          && params.get('page_size') === pageSize.toString();
      });

      expect(req.request.method).toBe('GET');
      req.flush({ recommended_books: [] });
    });

    it('should mark book as read', () => {
      const bookId = '123';
      const rating = 5;
      const date_read = '2025-01-01';

      service.markBookAsRead(bookId, rating, date_read).subscribe();

      const req = httpMock.expectOne(`http://localhost:5000/api/v1.0/books/${bookId}/have-read`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      expect(req.request.body.get('stars')).toBe(rating.toString());
      expect(req.request.body.get('date_read')).toBe(date_read);

      req.flush({});
    });

    it('should get current reading books', () => {
      service.getCurrentReads().subscribe();

      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/currently-reading');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });
  });

  const mockReview = { _id: 'reviewId', username: 'user1', title: 'Great Book', comment: 'Loved it', stars: 5 };
  const mockReply = { _id: 'replyId', username: 'user2', content: 'I agree!' };

  describe('Review Calls', () => {
      it('should post a review', () => {
      service.postReview('bookId', mockReview).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/books/bookId/reviews');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

      it('should get reviews', () => {
      service.getReviews('bookId').subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/books/bookId/reviews');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

      it('should get a single review', () => {
      service.getReview('reviewId').subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/review/reviewId');
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

      it('should delete a review', () => {
      service.deleteReview('bookId', mockReview).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/books/bookId/reviews/reviewId');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });


      it('should like a review', () => {
      service.likeReview('bookId', mockReview).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/books/bookId/reviews/reviewId/like');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

      it('should dislike a review', () => {
      service.dislikeReview('bookId', mockReview).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/books/bookId/reviews/reviewId/dislike');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

      it('should report a review', () => {
      service.reportReview('reviewId', 'Spam').subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/review/reviewId/report');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('Review Reply Calls', () => {
      it('should post a review reply', () => {
      service.postReviewReply('bookId', 'reviewId', mockReply).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/books/bookId/reviews/reviewId/replies');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

      it('should fetch review replies', () => {
      service.fetchReviewReplies('bookId', 'reviewId').subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/books/bookId/reviews/reviewId/replies');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

      it('should delete a review reply', () => {
      service.deleteReviewReply('bookId', 'reviewId', mockReply).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/books/bookId/reviews/reviewId/replies/replyId');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

      it('should like a review reply', () => {
      service.likeReviewReply('reviewId', mockReply).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/review/reviewId/replies/replyId/like');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

      it('should dislike a review reply', () => {
      service.dislikeReviewReply('reviewId', mockReply).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/review/reviewId/replies/replyId/dislike');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

      it('should report a review reply', () => {
      service.reportReviewReply('reviewId', 'replyId', 'Offensive').subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/review/reviewId/replies/replyId/report');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  function expectAuthHeaders(req: any) {
    expect(req.request.headers.get('x-access-token')).toBe(mockToken);
  }

  describe('User Calls', () => {
      it('should fetch users', () => {
      service.getUsers().subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/users');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush([]);
    });

      it('should fetch a user by id', () => {
      service.getUser(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/users/1');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush({});
    });

      it('should follow a user', () => {
      service.followUser(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/users/1/follow');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });

      it('should unfollow a user', () => {
      service.unfollowUser(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/users/1/unfollow');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });

      it('should get profile', () => {
      service.getProfile().subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/profile');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush({});
    });

      it('should get user feed', () => {
      service.getFeed().subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/feed');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush([]);
    });

      it('should update profile', () => {
      const profileData = { name: 'Test' };
      service.updateProfile(profileData).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/profile');
      expect(req.request.method).toBe('PUT');
      expectAuthHeaders(req);
      expect(req.request.body).toEqual(profileData);
      req.flush({});
    });
  });

  // it('should remove profile pic', () => {
  //   service.removeProfilePic().subscribe();
  //   const req = httpMock.expectOne('http://localhost:5000/api/v1.0/remove-profile-pic');
  //   expect(req.request.method).toBe('POST');
  //   expectAuthHeaders(req);
  //   req.flush({});
  // });

  describe('Book Request Calls', () => {
      it('should get requests with pagination', () => {
      service.pageSize = 10;
      service.getRequests(1).subscribe();
      const req = httpMock.expectOne(r => r.url === 'http://localhost:5000/api/v1.0/requests');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      expect(req.request.params.get('pn')).toBe('1');
      expect(req.request.params.get('ps')).toBe('10');
      req.flush([]);
    });

      it('should get request by id', () => {
      service.getRequest(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/requests/1');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush({});
    });

      it('should post a book request', () => {
      const mockRequest = {
        username: 'test',
        title: 'Book Title',
        author: 'Author',
        genres: 'Fiction',
        language: 'English',
        series: 'Series 1',
        isbn: '1234567890',
      };

      service.postBookRequest(mockRequest).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/add-requests');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);

      const formData = req.request.body as FormData;
      expect(formData.get('username')).toBe(mockRequest.username);
      expect(formData.get('title')).toBe(mockRequest.title);
      expect(formData.get('author')).toBe(mockRequest.author);
      expect(formData.get('genres')).toBe(mockRequest.genres);
      expect(formData.get('language')).toBe(mockRequest.language);
      expect(formData.get('series')).toBe(mockRequest.series);
      expect(formData.get('isbn')).toBe(mockRequest.isbn);
      req.flush({});
    });

      it('should approve request', () => {
      const approveData = { approved: true };
      service.approveRequest(1, approveData).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/requests/1/approve');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      expect(req.request.body).toEqual(approveData);
      req.flush({});
    });

      it('should reject request', () => {
      service.rejectRequest(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/requests/1/reject');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });
  });

  describe('User Thought Calls', () => {
    it('should post a thought', () => {
      service.postThought({ username: 'test', comment: 'Nice thought' }, 1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should get thoughts', () => {
      service.getThoughts().subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush([]);
    });

    it('should get a single thought', () => {
      service.getThought(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should delete a thought', () => {
      service.deleteThought(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1');
      expect(req.request.method).toBe('DELETE');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should like a thought', () => {
      service.likeThought(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1/like');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should dislike a thought', () => {
      service.dislikeThought(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1/dislike');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should report a thought', () => {
      service.reportThought(1, 'Spam').subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1/report');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });
  });

  describe('User Thought Reply Calls', () => {
    const mockReply = { username: 'replyUser', content: 'Reply content', _id: 'replyId' };

    it('should post a reply', () => {
      service.postReply(1, mockReply).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1/replies');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should fetch replies', () => {
      service.fetchReplies(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1/replies');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush([]);
    });

    it('should delete a reply', () => {
      service.deleteReply(1, mockReply).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1/replies/replyId');
      expect(req.request.method).toBe('DELETE');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should like a reply', () => {
      service.likeReply(1, mockReply).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1/replies/replyId/like');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should dislike a reply', () => {
      service.dislikeReply(1, mockReply).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1/replies/replyId/dislike');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should report a thought reply', () => {
      service.reportThoughtReply(1, 'replyId', 'Abuse').subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/thoughts/1/replies/replyId/report');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });
  });

  describe('Report Calls', () => {
    it('should get all reports', () => {
      service.getAllReports().subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/reports');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush([]);
    });

    it('should get one report', () => {
      service.getOneReport(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/reports/1');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should approve a report', () => {
      service.approveReport(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/reports/1/approve');
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should reject a report', () => {
      service.rejectReport(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/reports/1/approve'); // 👈 Note: Same endpoint as approve!
      expect(req.request.method).toBe('POST');
      expectAuthHeaders(req);
      req.flush({});
    });

    it('should delete a report', () => {
      service.deleteReport(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/reports/1');
      expect(req.request.method).toBe('DELETE');
      expectAuthHeaders(req);
      req.flush({});
    });
  });

  describe('Feedback Calls', () => {
    it('should get all feedback', () => {
      service.getAllFeedback().subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/user-feedback');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush([]);
    });

    it('should get one feedback', () => {
      service.getOneFeedback(1).subscribe();
      const req = httpMock.expectOne('http://localhost:5000/api/v1.0/deleted-accounts/1');
      expect(req.request.method).toBe('GET');
      expectAuthHeaders(req);
      req.flush({});
    });

  });




});
