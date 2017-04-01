import { Component } from '@angular/core';
import { AngularFire, FirebaseAuthState, FirebaseListObservable } from 'angularfire2';
import { AuthenticationService, FirebaseRefService, ToasterService, ErrorCodeService, ErrorCodes, VulgeService } from '../services/';
import { UserVoteModel, VulgeModel, NotificationModel, NotificationType, CursorModel, VulgeCollectionSettingsModel, VulgeCollectionSortByOptions } from '../viewModels';
import { Subscription } from 'rxjs';
import * as firebase from 'firebase';


@Component({
  selector: 'home',
  styles: [require('./home.component.scss')],
  template: require('./home.component.html')
})
export class HomeComponent {
  currentUser: firebase.User;
  vulgeCollection: Array<any>;
  activeWinner: any;
  listeners: Array<Subscription>;
  vulgeCollectionSub: Subscription;
  collectionIsEmpty: boolean;
  showSpinner: boolean;
  settingsModel: VulgeCollectionSettingsModel;
  constructor(public authService: AuthenticationService, public af: AngularFire, public firebaseRefService: FirebaseRefService, public toastr: ToasterService, public errorCodeService: ErrorCodeService, public vulgeService: VulgeService) {
    this.showSpinner = true;
    this.listeners = [];
    this.settingsModel = vulgeService.getCollectionSettings();
  }

  ngOnInit() {
    this.listeners.push(this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    }));

    this.firebaseRefService.getCurrentVulgeCollectionCount().then(metaDataObs => {
      let countChangedAction 
      if (this.settingsModel.enableRealTime) {
        this.listeners.push(metaDataObs.subscribe(count => {
          this.settingsModel.vulgeCount = count.$value;
          this.settingsModel.numPages = Math.ceil(count.$value / this.settingsModel.pageSize);
        }));
      }
      else {
        metaDataObs.take(1).subscribe(count => {
          this.settingsModel.vulgeCount = count.$value;
          this.settingsModel.numPages = Math.ceil(count.$value / this.settingsModel.pageSize);
        });
      }
    });

    this.activeWinner = this.firebaseRefService.getActiveVulgeWinner();
    this.getPage();
  }
  ngOnDestroy() {
    if (this.listeners && this.listeners.length) {
      this.listeners.forEach(sub => {
        sub.unsubscribe();
      });
      this.listeners = [];
    }
  }

  getPage(cursor?: CursorModel) {
    this.showSpinner = true;
    this.firebaseRefService.getCurrentVulgeCollection(this.settingsModel.pageSize, cursor).then(vulgeCollectionRef => {
      if (vulgeCollectionRef) {
        if (this.vulgeCollectionSub) {
          this.vulgeCollectionSub.unsubscribe();
        }
        let vulgeResponse = (data) => {        
          if (data && data.length) {
            this.collectionIsEmpty = false;
            this.vulgeCollection = data.filter((item, index) => {return index < (this.settingsModel.pageSize)});
            let lastVulge = data[data.length - 1];
            let firstVulge = data[0]          
            this.settingsModel.pageCursors[this.settingsModel.currentPage] = new CursorModel(this.getStartAtValue(lastVulge), lastVulge.$key);
          }
          else if(this.settingsModel.currentPage != 1){
            //handle edge case
            this.settingsModel.currentPage = 1;
            this.getPage();          
          }
          else{
            this.collectionIsEmpty = true;
            this.vulgeCollection = [];
          }
          this.showSpinner = false;
        };
        if (this.settingsModel.enableRealTime) {
          this.vulgeCollectionSub = vulgeCollectionRef.subscribe(vulgeResponse);
        }
        else {
          this.vulgeCollectionSub = vulgeCollectionRef.take(1).subscribe(vulgeResponse);
        }
       this.listeners.push(this.vulgeCollectionSub);
      }
    });
  }

  changePage(page: number) {
    if (!this.collectionIsEmpty && this.settingsModel.numPages > 1) {
        this.getPage(this.settingsModel.pageCursors[page-1]);      
    }
  }

  getStartAtValue(vulgeObj) {
    switch (VulgeCollectionSortByOptions[this.settingsModel.sortBy]) {
      case VulgeCollectionSortByOptions.Votes:
        return vulgeObj.voteOrder;
      case VulgeCollectionSortByOptions.Newest:
        return vulgeObj.createdDate;
      case VulgeCollectionSortByOptions.Oldest:
        return vulgeObj.createdDate;
      case VulgeCollectionSortByOptions.Controversial:
        //todo add controversial field to vulge Obj
        return vulgeObj.votes;
    }
  }

  vote(vulgeKey: string, up: boolean) {
    if (this.currentUser) {
      this.firebaseRefService.getCurrentUserProfile(this.currentUser.uid, true).take(1).subscribe(userProfile => {
        let profile = userProfile.val();
        if (profile && profile.votes > 0) {
          this.vulgeService.vote(vulgeKey, up).then(result => {
            //Todo: maybe do something here
            result.take(1).subscribe(res => {
              if (res && res.success) {

              } else {
                this.toastr.error(ErrorCodes.voting_period_expired)
              }
            })
          });
        }
        else {
          this.toastr.warning(ErrorCodes.user_no_votes);
        }
      });
    }
    else {
      this.toastr.warning(ErrorCodes.user_create_account_to_vote);
    }
  }

  toggleRealTime() {
    console.log("toggleRealTime");
  }

  showMore() {
    console.log("show more");
  }
}
