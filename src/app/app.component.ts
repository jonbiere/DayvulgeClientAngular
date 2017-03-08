//root site stylesheet.
require('./styles/root.scss')
import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { AngularFire, FirebaseAuthState, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { AuthenticationService, VulgeService, HelperService } from './services'
import { Profile } from './viewModels';


@Component({
  selector: 'app',
  styles: [require('./app.component.scss')],
  template: require('./app.component.html'),
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  angularclassLogo = 'assets/img/angularclass-avatar.png';
  name = 'Angular 2 Webpack Starter';
  url = 'https://twitter.com/AngularClass';
  currentUser: firebase.User = null;
  profile: FirebaseObjectObservable<any>;
  currentUserVotes: FirebaseListObservable<any>;
  currentUserNotifications: FirebaseListObservable<any>;
  sideMenuOpen: boolean;

  constructor(public af: AngularFire, public authService: AuthenticationService, public vulgeService: VulgeService, public helperService: HelperService) {
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profile = this.vulgeService.getCurrentUserProfile(user.uid, false);
        this.currentUserVotes = this.vulgeService.getCurrentUserVotes(this.currentUser.uid);
        this.currentUserNotifications = this.vulgeService.getUserNotificationCollection(this.currentUser.uid);
      }
      else {
        this.profile = null;
        this.currentUserVotes = null;
        this.currentUserNotifications = null;
      }
    });
  }

  logout() {
    if (this.currentUser) {
      this.authService.logout();
    }
  }

  markNotificationsRead(type) {
    this.vulgeService.getUserNotificationCollection(this.currentUser.uid).take(1).subscribe(notifications => {
      if (notifications && notifications.length) {
        let dirtyItems = notifications.filter(item => {
          return !item.hasSeen && item.type === type;
        });
        let updateObj = {};
        dirtyItems.forEach(item => {
          updateObj[item.$key] = { hasSeen: true };
        });
        this.af.database.object(`/userObjs/userNotifications/${this.currentUser.uid}`).update(updateObj);
      }
    })
  }

  toggleMobileSideMenu() {
    this.sideMenuOpen = !this.sideMenuOpen
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.sideMenuOpen = false;
  }
}