import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { CursorModel, VulgeCollectionMetaModel } from '../viewModels';
import { Subscription, Observable } from 'rxjs';

@Injectable()
export class FirebaseRefService {
    private listners: Array<Subscription>;
    private currentVulgeCollectionMetaData: VulgeCollectionMetaModel;

    constructor(public af: AngularFire) {
        this.listners = [];
        this.listners.push(this.af.database.object('/activeCollection').subscribe(activeCollection => {
            if (activeCollection.$exists()) {
                let key = Object.keys(activeCollection)[0];
                this.currentVulgeCollectionMetaData = new VulgeCollectionMetaModel(key, activeCollection[key]);
            }
            else {
                this.currentVulgeCollectionMetaData = null;
            }
        }))
    }


    getCurrentVulgeCollectionMetaData(): Promise<VulgeCollectionMetaModel> {
        if (this.currentVulgeCollectionMetaData) {
            return Promise.resolve(this.currentVulgeCollectionMetaData);
        }
        else {
            //Go try and get it again in case of unlikely race condition.
            return this.af.database.object('/activeCollection').take(1).toPromise().then(activeCollection => {
                if (activeCollection.$exists()) {
                    let key = Object.keys(activeCollection)[0];
                    this.currentVulgeCollectionMetaData = new VulgeCollectionMetaModel(key, activeCollection[key]);
                    return  this.currentVulgeCollectionMetaData;
                }
                else {
                    return null;
                }
            });
        }
    }

    getCurrentVulgeCollectionCount():Promise<FirebaseObjectObservable<any>>{
        return this.getCurrentVulgeCollectionMetaData().then(metaData =>{
            if (metaData && metaData.key) {
                return this.af.database.object(`/activeCollection/${metaData.key}`);
            }
        })
         
    }

    getCurrentVulgeCollection(pageSize?:number, cursor?:CursorModel): Promise<FirebaseListObservable<any>> {
        //TODO determine if we want ActiveVulgeCollection be observable or promise.
        return this.getCurrentVulgeCollectionMetaData().then(metaData => {
            let queryObj = { query: cursor ? {orderByChild: 'voteOrder', limitToFirst: pageSize ? (pageSize+1) : 25, startAt: {value:cursor.value, key: cursor.key}} : { orderByChild: 'voteOrder', limitToFirst: pageSize ? (pageSize+1):25 } }
            if (metaData && metaData.key) {
                return this.af.database.list(`/vulgeCollections/${metaData.key}/vulges`, queryObj);
            }
        });
    }

    // getCurrentVulgeCollectionOld(pageSize?:number, cursor?:CursorModel):Promise<firebase.database.Query>{
    //     return this.getCurrentVulgeCollectionMetaData().then(metaData => {
    //         if (metaData && metaData.key) {
    //             //return this.af.database.list(`/vulgeCollections/${metaData.key}/vulges`, queryObj);
    //             if(cursor){
    //                 return firebase.database().ref(`/vulgeCollections/${metaData.key}/vulges`).limitToLast(pageSize||25).endAt(null, cursor.key);
    //             }
    //             else{
    //                 return firebase.database().ref(`/vulgeCollections/${metaData.key}/vulges`).limitToLast(pageSize||25);
    //             }
    //         }
    //     });
    // }


    getActiveVulgeWinner(): FirebaseObjectObservable<any> {
        return this.af.database.object('/activeWinner');
    }

    getUserVulgeInfoCollection(userKey: string): FirebaseListObservable<any> {
        return this.af.database.list(`/userObjs/userVulgesInfo/${userKey}`);
    }
    getUserVulgeVotesCollection(userKey: string, vulgeKey: string): FirebaseListObservable<any> {
        return this.af.database.list(`/userObjs/userVulgesVotes/${userKey}/${vulgeKey}`);
    }

    getCurrentUserProfile(userKey: string, preserveSnapshot: boolean): FirebaseObjectObservable<any> {
        return this.af.database.object(`/userObjs/userProfiles/${userKey}/`, { preserveSnapshot: preserveSnapshot });
    }

    getCurrentUserVotes(userKey: string): FirebaseListObservable<any> {
        return this.af.database.list(`/userObjs/userVotes/${userKey}`);
    }

    getVulgeByKey(vulgeKey: string, preserveSnapshot: boolean): Promise<FirebaseObjectObservable<any>> {
        return this.getCurrentVulgeCollectionMetaData().then(metaData => {
            if (metaData && metaData.key) {
                return this.af.database.object(`/vulgeCollections/${metaData.key}/vulges/${vulgeKey}`, { preserveSnapshot: preserveSnapshot });
            }
        });

    }

    getUserNotificationCollection(userKey: string): FirebaseListObservable<any> {
        return this.af.database.list(`/userObjs/userNotifications/${userKey}`);
    }
}