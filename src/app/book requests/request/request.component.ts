import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { WebService } from '../../web.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'request',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule],
  providers: [WebService, AuthService],
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})

export class RequestComponent implements OnInit {
  requests: any;
  approveForm: any;
  showApproveForm = false;
  selectedRequest: any;
  submissionMessage: string = '';
  genres: string[] = [];
  filteredGenres: string[] = [];
  selectedGenres: string[] = [];
  genreSearch: string = '';
  previewUrl: string | null = null;
  isApproving: boolean = false;
  isUploading: boolean = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private webService: WebService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.webService.getRequest(this.route.snapshot.paramMap.get('id'))
      .subscribe((response: any) => {
        this.requests = [response];
      });
  }

  openApprovalForm(request: any) {
    this.selectedRequest = request;
    this.showApproveForm = true;
    this.selectedGenres = [...request.genres];

    // Initialize the form with request data (allowing modifications)
    this.approveForm = this.formBuilder.group({
      title: [request.title, Validators.required],
      author: [request.author, Validators.required],
      genres: [request.genres, Validators.required],
      genreSearch: [''],
      language: [request.language, Validators.required],
      series: [request.series || ''],
      publishDate: [request.publishDate || ''],
      isbn: [request.isbn || ''],
      description: [''],
      characters: [''],
      triggers: [''],
      bookFormat: [''],
      edition: [''],
      pages: [0],
      publisher: [''],
      firstPublishDate: [''],
      awards: [''],
      coverImg: ['/images/no_cover.jpg'],  // Ensure this is included in the form
      price: [0.0]
    });
    this.fetchGenres();

    //this.previewUrl =
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
      this.uploadCoverImg(file);
    };
    reader.readAsDataURL(file);
  }

  uploadCoverImg(image: File) {
    this.isUploading = true;
    const formData = new FormData();
    formData.append('image', image);

    this.http.post<any>('http://localhost:5000/api/v1.0/upload-image', formData).subscribe(
      response => {
        if (response.url) {
          this.approveForm.patchValue({ coverImg: response.url });
          this.previewUrl = response.url;
        } else {
          console.error('Failed to upload image:', response);
        }
        this.isUploading = false;
      },
      error => {
        console.error('Error uploading image:', error);
        this.isUploading = false;
      }
    );
  }

  fetchGenres() {
    this.http.get<string[]>('http://localhost:5000/api/v1.0/genres').subscribe({
      next: (data) => {
        this.genres = data;
        this.filteredGenres = data;  // Initially show all genres in the filtered list
      },
      error: (error: any) => {
        console.error('Error fetching genres:', error);
        this.submissionMessage = 'Failed to load genres.';
      }
    });
  }

  // Filter genres based on the search input
  onSearchGenres() {
    const searchQuery = this.approveForm.get('genreSearch')?.value.toLowerCase() || '';  // Ensure genreSearch has a value
    this.filteredGenres = this.genres.filter(genre =>
      genre.toLowerCase().includes(searchQuery)  // Case-insensitive search
    );
  }

  // Toggle genre selection
  toggleGenre(genre: string) {
    const index = this.selectedGenres.indexOf(genre);
    if (index === -1) {
      this.selectedGenres.push(genre);
    } else {
      this.selectedGenres.splice(index, 1);
    }

    // Update the FormArray for genres
    this.approveForm.get('genres')?.setValue(this.selectedGenres);
  }

  onSubmit() {
    if (this.isUploading) {
      console.log("Please wait for the image to finish uploading...");
      return;
    }

    if (this.approveForm.valid) {
      const approvedBook = this.approveForm.value;
      const formData = new FormData();

      formData.append("title", approvedBook.title);
      formData.append("author", approvedBook.author);
      formData.append("genres", this.selectedGenres.join(", "));
      formData.append("language", approvedBook.language);
      formData.append("series", approvedBook.series || "");
      formData.append("publishDate", approvedBook.publishDate || "");
      formData.append("isbn", approvedBook.isbn || "");
      formData.append("description", approvedBook.description || "");

      // Ensure characters, triggers, and awards are arrays before joining
      formData.append("characters", Array.isArray(approvedBook.characters) ? approvedBook.characters.join(", ") : "");
      formData.append("triggers", Array.isArray(approvedBook.triggers) ? approvedBook.triggers.join(", ") : "");
      formData.append("awards", Array.isArray(approvedBook.awards) ? approvedBook.awards.join(", ") : "");

      formData.append("bookFormat", approvedBook.bookFormat || "");
      formData.append("edition", approvedBook.edition || "");
      formData.append("pages", approvedBook.pages?.toString() || "0");
      formData.append("publisher", approvedBook.publisher || "");
      formData.append("firstPublishDate", approvedBook.firstPublishDate || "");
      formData.append("price", approvedBook.price?.toString() || "0.0");

      // Append image file if available
      if (this.approveForm.get('coverImg')?.value) {
        formData.append("coverImg", this.approveForm.get('coverImg')?.value);
      }

      const confirmApproval = confirm("Are you sure you want to approve this request?");
      if (!confirmApproval) {
        return;
      }

      console.log("Submitting approval request:", approvedBook);

      this.webService.approveRequest(this.selectedRequest._id, formData).subscribe(
        (response: any) => {
          alert('Request approved successfully!');
          this.previewUrl = response.coverImg;
          this.showApproveForm = false;
        },
        (error) => {
          alert('Error approving request');
        }
      );
    }
  }




  rejectRequest(request: any) {
    if (confirm('Are you sure you want to reject this?')) {
      this.webService.rejectRequest(request._id).subscribe({
        next: () => {
          console.log("Request deleted successfully.");
          window.location.reload();
        },
        error: (err) => {
          console.error("Error deleting request:", err);
        }
      });
    } else {
      console.error("No token found, cannot delete request.");
    }
  }
}
