import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  cn: boolean;

  constructor() {
    this.cn = window.location.hostname.includes('cn');
  }

  ngOnInit() {
  }

}
