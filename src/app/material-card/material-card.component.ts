import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MaterialItemData } from '../model/materialitemdata';
import { MaterialInfo } from '../model/materialinfo';

@Component({
  selector: 'app-material-card',
  templateUrl: './material-card.component.html',
  styleUrls: ['./material-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialCardComponent implements OnInit {
  @Input() item: MaterialInfo;
  @Input() itemdata: MaterialItemData;

  @Output() dataChange = new EventEmitter<MaterialItemData>();
  @Output() reportMerge = new EventEmitter<string>();

  onInputChange(): void {
    this.dataChange.emit(this.itemdata);
  }

  doMerge(): void {
    this.reportMerge.emit(this.item.name);
  }

  constructor() {
  }

  ngOnInit() {
  }

}
