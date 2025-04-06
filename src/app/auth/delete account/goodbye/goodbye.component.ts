import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WebService } from '../../../web.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'goodbye',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  providers: [WebService],
  templateUrl: './goodbye.component.html',
  styleUrls: ['./goodbye.component.css']
})
export class GoodbyeComponent {

}
