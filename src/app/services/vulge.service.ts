import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import * as q  from 'q';
@Injectable()
export class VulgeService {

    constructor(public af:AngularFire) { 

    }

    
    getCurrentVulgeCollectionKey():Promise<string>{
        return this.af.database.object('/activeCollection').take(1).toPromise().then(activeCollection => {
            if(activeCollection.$exists()){
                return Object.keys(activeCollection)[0]
            }
            else{
                return null;
            }
        });     
    }

    getCurrentVulgeCollection():Promise<FirebaseListObservable<any>>{
        //TODO determine if we want ActiveVulgeCollection be observable or promise.
        
        return this.getCurrentVulgeCollectionKey().then( collectionKey => {
            if(collectionKey){
                return this.af.database.list(`/vulgeCollections/${collectionKey}/vulges`, { query: {orderByChild: 'votes', limitToLast:25}});
            }
        });
        
    }

    getUserVulgeInfoCollection(userKey:string):FirebaseListObservable<any>{
        return this.af.database.list(`/userObjs/userVulgesInfo/${userKey}`);
    }
    getUserVulgeVotesCollection(userKey:string, vulgeKey:string):FirebaseListObservable<any>{
        return this.af.database.list(`/userObjs/userVulgesVotes/${userKey}/${vulgeKey}`);
    }

    getCurrentUserProfile(userKey:string, preserveSnapshot: boolean):FirebaseObjectObservable<any>{
        return this.af.database.object(`/userObjs/userProfiles/${userKey}/`,{preserveSnapshot: preserveSnapshot});
    }

    getCurrentUserVotes(userKey:string):FirebaseListObservable<any>{
        return this.af.database.list(`/userObjs/userVotes/${userKey}`);
    }

    getVulgeByKey(vulgeKey:string, preserveSnapshot: boolean):Promise<FirebaseObjectObservable<any>>{
        return this.getCurrentVulgeCollectionKey().then( collectionKey =>{
            if(collectionKey){
                return this.af.database.object(`/vulgeCollections/${collectionKey}/vulges/${vulgeKey}`,{preserveSnapshot: preserveSnapshot});
            }
        });
        
    }

    getUserNotificationCollection(userKey:string):FirebaseListObservable<any>{
        return this.af.database.list(`/userObjs/userNotifications/${userKey}`);
    }
}