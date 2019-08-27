import { Component, HostListener } from '@angular/core';
import { MdcSnackbarService } from '@blox/material';
import { SwUpdate } from '@angular/service-worker';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
declare var ga: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '明日方舟工具箱 by 一只灰猫';
  drawerOpen = false;
  deferredPrompt: any;
  baseUrl: string;
  nav: any;
  temporary = 'temporary';
  showNavbar = true;

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

  constructor(private snackBar: MdcSnackbarService,
              private swUpdate: SwUpdate,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.baseUrl = window.location.origin;
    this.nav = window.navigator;
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate();
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
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });
    this.activatedRoute.queryParams.subscribe(params => {
      this.showNavbar = !('hidenav' in params);
    });
  }
  doUpdate() {
    this.swUpdate.activateUpdate().then(() => window.location.reload());
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


  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e) {
    e.preventDefault();
    this.deferredPrompt = e;
  }
}
