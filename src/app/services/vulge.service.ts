import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2'
@Injectable()
export class VulgeService {

    constructor(public af:AngularFire) { 

    }

    
    getCurrentVulgeCollectionKey():string{
        return 'testCollection';
    }

    getCurrentVulgeCollection():FirebaseListObservable<any>{
        let collectionKey = this.getCurrentVulgeCollectionKey();
        return this.af.database.list(`/vulgeCollections/${collectionKey}/vulges`, { query: {orderByChild: 'votes', limitToLast:25}});
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

    getVulgeByKey(vulgeKey:string, preserveSnapshot: boolean):FirebaseObjectObservable<any>{
        let collectionKey = this.getCurrentVulgeCollectionKey();
        return this.af.database.object(`/vulgeCollections/${collectionKey}/vulges/${vulgeKey}`,{preserveSnapshot: preserveSnapshot});
    }

    getUserNotificationCollection(userKey:string):FirebaseListObservable<any>{
        return this.af.database.list(`/userObjs/userNotifications/${userKey}`);
    }
}