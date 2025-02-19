import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
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
  request_list: any;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private webService: WebService
  ) { }

  ngOnInit(): void {
    this.webService.getRequest(this.route.snapshot.paramMap.get('id'))
    .subscribe( (response: any) => {
      this.request_list = [response];
    });
  }


}
