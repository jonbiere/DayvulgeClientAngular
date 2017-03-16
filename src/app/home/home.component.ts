import { Component } from '@angular/core';
import { AngularFire, FirebaseAuthState, FirebaseListObservable } from 'angularfire2';
import { AuthenticationService, FirebaseRefService, ToasterService, ErrorCodeService, ErrorCodes } from '../services/';
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
  listers: Array<Subscription>;
  constructor(public authService: AuthenticationService, public af: AngularFire, public firebaseRefService: FirebaseRefService, public toastr: ToasterService, public errorCodeService:ErrorCodeService) {
  }

  ngOnInit() {
    this.showSpinner = true;
    this.listers = [];
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    this.activeWinner = this.firebaseRefService.getActiveVulgeWinner();
    this.firebaseRefService.getCurrentVulgeCollection().then(vulgeCollection => {
      this.vulgeCollection = vulgeCollection;
      if (this.vulgeCollection) {
        this.listers.push(this.vulgeCollection.subscribe(data => {
          //this gets called anytime the list changes in anyway. So alot.
          if (data) {
            this.showSpinner = false;
          }
        }));
      }
    })
  }
  ngOnDestroy() {
    if (this.listers && this.listers.length) {
      this.listers.forEach(sub => {
        sub.unsubscribe();
      });
    }
  }

  vote(vulgeKey: string, up: boolean) {
    if (this.currentUser) {
      this.firebaseRefService.getCurrentUserProfile(this.currentUser.uid, true).take(1).subscribe(userProfile => {
        let profile = userProfile.val();
        if (profile && profile.votes > 0) {
          this.firebaseRefService.getCurrentUserProfile(this.currentUser.uid, false).update({
            votes: --profile.votes
          }).then(() => {
            this.firebaseRefService.getVulgeByKey(vulgeKey, false).then(vulgeObs => {
              if (vulgeObs) {
                vulgeObs.take(1).subscribe(vulge => {
                  if (vulge.$exists()) {
                    vulgeObs.update({
                      votes: up ? ++vulge.votes : --vulge.votes
                    });
                    this.registerUserVote(vulge, up);
                    this.registerVoteNotification(vulge, up);
                    this.registerVulgeVote(vulge, up);
                  }
                });
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

  registerVulgeVote(vulge, up: boolean) {
    this.firebaseRefService.getUserVulgeVotesCollection(vulge.userKey, vulge.$key).push({
      userKey: this.currentUser.uid,
      voteUp: up,
      profilePic: this.currentUser.photoURL
    })
  }

  registerUserVote(vulge: any, up: boolean) {
    this.af.database.object(`/userObjs/userVotes/${this.currentUser.uid}/${vulge.$key}`).take(1).subscribe(userVote => {
      if (userVote.$exists()) {
        if (up) {
          userVote.numUpVotes = userVote.numUpVotes ? ++userVote.numUpVotes : 1;
        }
        else {
          userVote.numDownVotes = userVote.numDownVotes ? ++userVote.numDownVotes : 1;
        }
        userVote.voteDate = firebase.database['ServerValue']['TIMESTAMP'];
        this.af.database.object(`/userObjs/userVotes/${this.currentUser.uid}/${vulge.$key}`).update(userVote);
      }
      else {
        this.af.database.object(`/userObjs/userVotes/${this.currentUser.uid}/${vulge.$key}`).set(
          new UserVote(vulge.userName, "", vulge.vulgeText, firebase.database['ServerValue']['TIMESTAMP'], up ? 1 : 0, up ? 0 : 1));
      }
    });
  }

  registerVoteNotification(vulge: any, up: boolean) {
    //todo this should probably be handled on the backend. Otherwise user can manipulate notification message.
    this.firebaseRefService.getUserNotificationCollection(vulge.userKey).push(
      new Notification(vulge.userKey,
        this.currentUser.email,
        firebase.database['ServerValue']['TIMESTAMP'],
        up ? NotificationType.UpVote : NotificationType.DownVote)
    );
  }

  showMore() {
    console.log("show more");
  }
}
