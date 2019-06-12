import { Component } from '@angular/core';
import { MdcSnackbarService } from '@blox/material';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '明日方舟工具箱 by 一只灰猫';
  drawerOpen = false;
  temporary = 'temporary';
  baseUrl: string;
  nav: any;

  dialog = {
    title: '提示',
    message: '',
    decline: '不了',
    accept: '好的',
    acceptCallback: () => { },
    declineCallback: () => { }
  };

  toggleDrawer(): void {
    this.drawerOpen = !this.drawerOpen;
  }

  showSnackBar(msg: string, action: string) {
    this.snackBar.show({
      message: msg,
      actionText: action,
      multiline: false,
      actionOnBottom: false
    });
  }

  constructor(private snackBar: MdcSnackbarService, private swUpdate: SwUpdate) {
    this.baseUrl = window.location.origin;
    this.nav = window.navigator;
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        const snackbarRef = this.snackBar.show({
          message: '有新版本可用，是否更新？(同样可以点击右上角手动更新）',
          actionText: '更新',
          multiline: true,
          actionOnBottom: true,
          timeout: 5000
        });
        snackbarRef.action().subscribe(() => {
          this.doUpdate();
        });
      });
    }
  }
  doUpdate() {
    window.location.reload();
  }
  doShare() {
    if (this.nav && this.nav.share) {
      this.nav.share({
        title: this.title,
        text: this.title,
        url: window.location.origin
      });
    }
  }
  doClear() {
    localStorage.clear();
  }

  beforeClear() {
    this.dialog = {
      title: '提示',
      message: '是否清除本地输入数据？这在有些数据错误时很有用。（缓存数据不受影响）',
      accept: '好的',
      decline: '不了',
      declineCallback: () => { },
      acceptCallback: this.doClear
    };
  }
}
