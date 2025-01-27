import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'inbox',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  providers: [WebService, AuthService],
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit {
  messages: any[] = [];
  loading: boolean = true;
  token: string | null = null;
  loggedInUserName: string = '';

  constructor(
    private router: Router,
    private webService: WebService,
    private authService: AuthService
  ) {
    this.loggedInUserName = this.authService.getLoggedInName();
  }

  ngOnInit() {
    console.log("Logged in username:", this.loggedInUserName);
    this.token = localStorage.getItem('x-access-token');
    if (this.token) {
      this.getMessages();
    } else {
      console.error("No token found, navigating to login.");
      this.router.navigate(['/login']);
    }
  }

  getMessages() {
    this.webService.getMessages().subscribe({
      next: (data: any[]) => {
        this.messages = data;
        this.loading = false;
        console.log("Messages fetched:", this.messages);
      },
      error: (err) => {
        console.error("Error fetching messages:", err);
        this.loading = false;
      }
    });
  }

  deleteMessage(id: string) {
    if (this.token) {
      console.log("Deleting message with id:", id);
      this.webService.deleteMessage(id).subscribe({
        next: () => {
          console.log("Message deleted successfully.");
          this.getMessages();
        },
        error: (err) => {
          console.error("Error deleting message:", err);
        }
      });
    } else {
      console.error("No token found, cannot delete message.");
    }
  }

  showMessage(id: string) {
    this.webService.getMessage(id).subscribe({
      next: (message: any) => {
        console.log("Message details:", message);
      },
      error: (err) => {
        console.error("Error fetching message details:", err);
      }
    });
  }

  trackMessage(index: number, message: any): string {
    return message._id;
  }
}
