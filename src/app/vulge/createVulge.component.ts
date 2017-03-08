import { Component, OnInit } from '@angular/core';
import { AngularFire } from 'angularfire2'
import { AuthenticationService, VulgeService} from '../services'
import { Vulge } from '../viewModels'
import * as firebase from 'firebase'

@Component({
    selector: 'create-vulge',
    templateUrl: 'createVulge.component.html'
})
export class CreateVulgeComponent implements OnInit {
    currentUser:firebase.User = null;
    vulgeModel:Vulge;
    constructor(public af:AngularFire, public authService: AuthenticationService, public vulgeService:VulgeService) {
        this.vulgeModel = new Vulge();
    }

    ngOnInit() {
        this.authService.getCurrentUser().subscribe(user => {
            this.currentUser = user;
        });
    }
    
    createVulge(event:Event){
        event.preventDefault();
        let vulgeCollection = this.vulgeService.getCurrentVulgeCollection();

        this.vulgeModel.userKey = this.currentUser.uid;
        this.vulgeModel.userName = this.currentUser.email;
        this.vulgeModel.createdDate = firebase.database['ServerValue']['TIMESTAMP'];

        //todo this is not secure. Possible handle votes with application user.
        this.vulgeModel.votes = 0;

        vulgeCollection.push(this.vulgeModel).then(result => {

            let userVulgeCollection = this.af.database.object(`/userObjs/userVulgesInfo/${this.currentUser.uid}/${result.key}`);
            userVulgeCollection.set(this.vulgeModel).then(() =>{
            }, error => {
                console.log(error);
            })
        }, 
        error => {
            console.log(error);
        });

    }

    
}