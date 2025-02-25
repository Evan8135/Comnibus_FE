import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { WebService } from '../../web.service';

@Component({
  selector: 'request',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule],
  providers: [WebService],
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

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private webService: WebService
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
      coverImg: [''],  // Ensure this is included in the form
      price: [0.0]
    });
    this.fetchGenres();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Preview the image temporarily as a Blob URL
      this.previewUrl = URL.createObjectURL(file);
      this.approveForm.patchValue({ coverImg: file });

      // Upload the image to the backend
      this.uploadCoverImg(file);  // Upload the image when a file is selected
      console.log("Image Url: ", this.previewUrl)
    }
  }

  uploadCoverImg(image: File) {
    const formData = new FormData();
    formData.append('image', image);

    this.http.post<any>('http://localhost:5000/api/v1.0/upload-image', formData)
      .subscribe(response => {
        if (response.url) {
          // Update the coverImg with the permanent URL received from the backend
          this.approveForm.patchValue({ coverImg: response.url });
          this.previewUrl = response.url;  // Use this URL for preview
        } else {
          console.error('Failed to upload image:', response);
        }
      }, error => {
        console.error('Error uploading image:', error);
      });
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
    if (this.isApproving) {
      console.log("Please wait for the image to finish uploading...");
      return;
    }
    if (this.approveForm.valid) {
      const approvedBook = this.approveForm.value;

      const confirmApproval = confirm("Are you sure you want to approve this request?");
      if (!confirmApproval) {
        return; // Stop submission if user cancels
      }
      console.log("Submitting request:", approvedBook);
      this.webService.approveRequest(this.selectedRequest._id, this.approveForm.value).subscribe(
        (response) => {
          alert('Request approved successfully!');
          this.showApproveForm = false;
        },
        (error) => {
          alert('Error approving request');
        }
      );
    }
  }
}
