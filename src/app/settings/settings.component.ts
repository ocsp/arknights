import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MdcSnackbarService } from '@blox/material';
import { FetchService } from '../fetch.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  dialog = {
    title: '提示',
    message: '',
    decline: '不了',
    accept: '好的',
    acceptCallback: () => { },
    declineCallback: () => { }
  };
  isExtraSmall = false;
  isMaxFontSize = true;
  detectColor = '#00ff00';
  constructor(private fetch: FetchService, private router: Router, private snackbar: MdcSnackbarService) {
  }

  ngOnInit() {
    this.isExtraSmall = this.fetch.getLocalStorage("s-exsm", false);
    this.isMaxFontSize = this.fetch.getLocalStorage("detect-mfs", true);
    this.detectColor = this.fetch.getLocalStorage("detect-tclr", '#00ff00');
  }

  saveSettings() {
    this.fetch.setLocalStorage("s-exsm", this.isExtraSmall);
    this.fetch.setLocalStorage("detect-mfs", this.isMaxFontSize);
    this.fetch.setLocalStorage("detect-tclr", this.detectColor);
    console.log(localStorage);
  }


  showSnackBar(msg: string, action: string) {
    this.snackbar.show({
      message: msg,
      actionText: action,
      multiline: false,
      actionOnBottom: false
    });
  }

  beforeClear() {
    this.dialog = {
      title: '提示',
      message: '是否清除本地输入数据？这在有些数据错误时很有用。（缓存数据不受影响）',
      accept: '好的',
      decline: '不了',
      declineCallback: () => { },
      acceptCallback: () => {
        localStorage.clear();
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigateByUrl(currentUrl);
        });
        this.showSnackBar('输入数据已清空', '好的');
      }
    };
  }
}
