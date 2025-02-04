import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { MessageService } from '../message.service'; // Import the shared service
import { CommonModule } from '@angular/common';

@Component({
  selector: 'inbox',
  standalone: true,
  imports: [CommonModule],
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
    public webService: WebService,
    private authService: AuthService,
    private messageService: MessageService // Inject the shared service
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
      next: (response: any) => {
        if (response && response.messages) {
          this.messages = response.messages;
          const hasUnreadMessages = response.hasUnreadMessages || false;
          this.messageService.setUnreadMessages(hasUnreadMessages); // Update shared service
        } else {
          this.messages = [];
          this.messageService.setUnreadMessages(false); // Update shared service
        }
        this.loading = false;
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
        this.markMessageAsRead(id);
      },
      error: (err) => {
        console.error("Error fetching message details:", err);
      }
    });
  }

  markMessageAsRead(id: string) {
    this.webService.markAsRead(id).subscribe({
      next: () => {
        console.log("Message marked as read:", id);
        this.getMessages(); // Refresh messages
        // After refreshing messages, update unread message status
        const hasUnreadMessages = this.messages.some(message => !message.read);
        this.messageService.setUnreadMessages(hasUnreadMessages);
      },
      error: (err) => {
        console.error("Error marking message as read:", err);
      }
    });
  }


  trackMessage(index: number, message: any): string {
    return message._id;
  }
}
