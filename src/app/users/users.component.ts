import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WebService } from '../web.service';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [WebService, AuthService],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  loading: boolean = true;

  constructor(public webService: WebService, public authService: AuthService) {}

  ngOnInit() {
    this.webService.getUsers().subscribe((response: any) => {
      this.users = response;
      this.filteredUsers = response;
      this.loading = false;
    });
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  suspendUser(user: any) {
    if (confirm(`Are you sure you want to ban ${user.username}?`)) {
      this.authService.suspendUser(user._id).subscribe(
        () => {
          this.users = this.users.filter(u => u._id !== user._id);
          this.filteredUsers = this.filteredUsers.filter(u => u._id !== user._id);
          alert(`${user.username} has been banned.`);
        },
        error => {
          console.error('Error banning user:', error);
          alert('Failed to ban user.');
        }
      );
    }
  }

  banUser(user: any) {
    if (confirm(`Are you sure you want to ban ${user.username}?`)) {
      this.authService.banUser(user._id).subscribe(
        () => {
          this.users = this.users.filter(u => u._id !== user._id);
          this.filteredUsers = this.filteredUsers.filter(u => u._id !== user._id);
          alert(`${user.username} has been banned.`);
        },
        error => {
          console.error('Error banning user:', error);
          alert('Failed to ban user.');
        }
      );
    }
  }
}
