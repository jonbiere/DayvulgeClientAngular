import { Component } from '@angular/core';
import { AngularFire, FirebaseAuthState, FirebaseListObservable } from 'angularfire2';
import { AuthenticationService, VulgeService, ToasterService, ErrorCodeService } from '../services/';
import {UserVote, Vulge, Notification, NotificationType} from '../viewModels';
import * as firebase from 'firebase';


@Component({
  selector: 'home',
  styles: [require('./home.component.scss')],
  template: require('./home.component.html')
})
export class HomeComponent {
  currentUser: firebase.User;
  vulgeCollection: FirebaseListObservable<any>;
  showSpinner:boolean;
  constructor(public authService: AuthenticationService, public af: AngularFire, public vulgeService: VulgeService, public toastr: ToasterService) {
  }

  ngOnInit() {
    this.showSpinner = true;
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    this.vulgeCollection = this.vulgeService.getCurrentVulgeCollection()
    this.vulgeCollection.subscribe( data => {
      //this gets called anytime the list changes in anyway. So alot.
        if(data){
          this.showSpinner = false;
        }
    });
  
  }

  vote(vulgeKey: string, up: boolean) {
    if (this.currentUser) {
      this.vulgeService.getCurrentUserProfile(this.currentUser.uid, true).take(1).subscribe(userProfile => {
        let profile = userProfile.val();
        if (profile && profile.votes > 0) {
          this.vulgeService.getCurrentUserProfile(this.currentUser.uid, false).update({
            votes: --profile.votes
          }).then(() => {
            this.vulgeService.getVulgeByKey(vulgeKey, false).take(1).subscribe(vulge => {
              this.vulgeService.getVulgeByKey(vulgeKey, false).update({
                votes: up ? ++vulge.votes : --vulge.votes
              });
              this.registerUserVote(vulge, up);
              this.registerVoteNotification(vulge, up);
              this.registerVulgeVote(vulge, up);
            });
          });
        }
        else {
          this.toastr.warning(ErrorCodeService.AppErrors.NO_VOTES);
        }
      });
    }
    else {
      this.toastr.warning(ErrorCodeService.AppErrors.CREATE_ACCOUNT_TO_VOTE);
    }
  }

  registerVulgeVote(vulge, up:boolean){
    this.vulgeService.getUserVulgeVotesCollection(vulge.userKey, vulge.$key).push({
      userKey: this.currentUser.uid,
      voteUp: up,
      profilePic: this.currentUser.photoURL
    })
  }

  registerUserVote(vulge:any, up:boolean) {
    this.af.database.object(`/userObjs/userVotes/${this.currentUser.uid}/${vulge.$key}`).take(1).subscribe( userVote => {
      if(userVote.$exists()){
        if (up) {
            userVote.numUpVotes = userVote.numUpVotes ? ++userVote.numUpVotes : 1;           
          }
        else{
            userVote.numDownVotes = userVote.numDownVotes ? ++userVote.numDownVotes : 1;
        }
        userVote.voteDate = firebase.database['ServerValue']['TIMESTAMP'];
        this.af.database.object(`/userObjs/userVotes/${this.currentUser.uid}/${vulge.$key}`).update(userVote);
      }
      else{
        this.af.database.object(`/userObjs/userVotes/${this.currentUser.uid}/${vulge.$key}`).set(
        new UserVote(vulge.userName, "", vulge.vulgeText, firebase.database['ServerValue']['TIMESTAMP'], up? 1:0 , up?0:1)); 
      }
    });
  }

  registerVoteNotification(vulge:any, up:boolean){
    //todo this should probably be handled on the backend. Otherwise user can manipulate notification message.
    this.vulgeService.getUserNotificationCollection(vulge.userKey).push(
      new Notification(vulge.userKey, 
      this.currentUser.email, 
      firebase.database['ServerValue']['TIMESTAMP'],
      up ? NotificationType.UpVote : NotificationType.DownVote)
    );
  }

  showMore(){
    console.log("show more");
  }
}
