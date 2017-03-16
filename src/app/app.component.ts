//root site stylesheet.
require('./styles/root.scss')
import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { AngularFire, FirebaseAuthState, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { AuthenticationService, FirebaseRefService, HelperService } from './services';
import { Profile } from './viewModels';
import {LoginComponent, CreateVulgeComponent} from './modals';




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

  constructor(private af: AngularFire, private authService: AuthenticationService, private firebaseRefService: FirebaseRefService, private helperService: HelperService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profile = this.firebaseRefService.getCurrentUserProfile(user.uid, false);
        this.currentUserVotes = this.firebaseRefService.getCurrentUserVotes(this.currentUser.uid);
        this.currentUserNotifications = this.firebaseRefService.getUserNotificationCollection(this.currentUser.uid);
      }
      else {
        this.profile = null;
        this.currentUserVotes = null;
        this.currentUserNotifications = null;
      }
    });
  }

  openLoginModal(){
    this.modalService.open(LoginComponent);
  }

  openCreateVulgeModal(){
    this.modalService.open(CreateVulgeComponent);
  }

  logout() {
    if (this.currentUser) {
      this.authService.logout();
    }
  }

  markNotificationsRead(type) {
    this.firebaseRefService.getUserNotificationCollection(this.currentUser.uid).take(1).subscribe(notifications => {
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
