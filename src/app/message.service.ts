import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private unreadMessagesSubject = new BehaviorSubject<boolean>(false); // initial value false
  unreadMessages$ = this.unreadMessagesSubject.asObservable();

  constructor() {
    // This can be initialized from localStorage or another source.
    const hasUnreadMessages = localStorage.getItem('hasUnreadMessages') === 'true';
    this.unreadMessagesSubject.next(hasUnreadMessages);
  }

  // This method updates the unread message status
  setUnreadMessages(status: boolean) {
    localStorage.setItem('hasUnreadMessages', status.toString());
    this.unreadMessagesSubject.next(status);
  }
}
