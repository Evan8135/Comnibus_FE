import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'navigation',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './nav.component.html'
})

export class NavComponent {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;

  constructor() {
    this.updateAuthStatus();
  }


  updateAuthStatus() {
    const token = localStorage.getItem('x-access-token');
    this.isLoggedIn = token !== null;

    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.isAdmin = payload && payload.admin === true;
    } else {
      this.isAdmin = false;
    }
  }


  toggleLogin() {
    if (this.isLoggedIn) {
      localStorage.removeItem('x-access-token');
    } else {
      console.warn('Toggle login called but no login mechanism provided');
    }
    this.updateAuthStatus();
  }


  toggleAdmin() {
    console.warn('Admin privileges cannot be toggled directly in the component.');
    this.updateAuthStatus();
  }
}
