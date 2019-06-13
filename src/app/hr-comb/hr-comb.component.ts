import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HrComb } from '../model/hrcomb';
import { FetchService } from '../fetch.service';

@Component({
  selector: 'app-hr-comb',
  templateUrl: './hr-comb.component.html',
  styleUrls: ['./hr-comb.component.scss']
})
export class HrCombComponent implements OnInit {
  @Input() hrcombs: Array<HrComb>;
  constructor(private fetch: FetchService) { }
  @Input() charSelected: '';
  @Input() option: number;

  @Output() reportCharClick = new EventEmitter<string>();

  // Note: without this trackBy function, *ngFor re-rendering will be extremely
  // slow due to the tracking mechanism.
  public trackComb(_: number, item: HrComb) {
    if (item === null) { return null; }
    return item.id;
  }

  onNameClick(name: string) {
    this.reportCharClick.emit(name);
  }

  ngOnInit() {
  }


}
