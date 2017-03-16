import { Component } from '@angular/core';
import { AngularFire, FirebaseAuthState, FirebaseListObservable } from 'angularfire2';
import { AuthenticationService, FirebaseRefService, ToasterService, ErrorCodeService, ErrorCodes, VulgeService } from '../services/';
import { UserVote, Vulge, Notification, NotificationType } from '../viewModels';
import { Subscription } from 'rxjs';
import * as firebase from 'firebase';


@Component({
  selector: 'home',
  styles: [require('./home.component.scss')],
  template: require('./home.component.html')
})
export class HomeComponent {
  currentUser: firebase.User;
  vulgeCollection: FirebaseListObservable<any>;
  showSpinner: boolean;
  activeWinner: any;
  listeners: Array<Subscription>;
  constructor(public authService: AuthenticationService, public af: AngularFire, public firebaseRefService: FirebaseRefService, public toastr: ToasterService, public errorCodeService:ErrorCodeService, public vulgeService:VulgeService) {
  }

  ngOnInit() {
    this.showSpinner = true;
    this.listeners = [];
    this.listeners.push(this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    }));

    this.activeWinner = this.firebaseRefService.getActiveVulgeWinner();
    this.firebaseRefService.getCurrentVulgeCollection().then(vulgeCollection => {
      this.vulgeCollection = vulgeCollection;
      if (this.vulgeCollection) {
        this.listeners.push(this.vulgeCollection.subscribe(data => {
          //this gets called anytime the list changes in anyway. So alot.
          if (data) {
            this.showSpinner = false;
          }
        }));
      }
    })
  }
  ngOnDestroy() {
    if (this.listeners && this.listeners.length) {
      this.listeners.forEach(sub => {
        sub.unsubscribe();
      });
    }
  }

  vote(vulgeKey: string, up: boolean) {
    if (this.currentUser) {
      this.firebaseRefService.getCurrentUserProfile(this.currentUser.uid, true).take(1).subscribe(userProfile => {
        let profile = userProfile.val();
        if (profile && profile.votes > 0) {
          this.vulgeService.vote(vulgeKey,up).then(result =>{
            //Todo: maybe do something here
            result.take(1).subscribe(res => {
              if(res && res.success){

              }else{
                this.toastr.error(this.errorCodeService.getErrorMessage(ErrorCodes.voting_period_expired))
              }
            })
          });
        }
        else {
          this.toastr.warning(this.errorCodeService.getErrorMessage(ErrorCodes.user_no_votes));
        }
      });
    }
    else {
      this.toastr.warning(this.errorCodeService.getErrorMessage(ErrorCodes.user_create_account_to_vote));
    }
  }

  showMore() {
    console.log("show more");
  }
}
