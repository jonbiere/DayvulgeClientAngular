import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { Subscription, Observable } from 'rxjs';
@Injectable()
export class FirebaseRefService {
    private listners: Array<Subscription>;
    private currentVulgeCollectionKey: string;

    constructor(public af: AngularFire) {
        this.listners = [];
        this.listners.push(this.af.database.object('/activeCollection').subscribe(activeCollection => {
            if (activeCollection.$exists()) {
                this.currentVulgeCollectionKey = Object.keys(activeCollection)[0];
            }
            else {
                this.currentVulgeCollectionKey = null;
            }
        }))
    }


    getCurrentVulgeCollectionKey(): Promise<string> {
        if (this.currentVulgeCollectionKey) {
            Promise.resolve(this.currentVulgeCollectionKey);
        }
        else {
            //Go try and get it again in case of unlikely race condition.
            return this.af.database.object('/activeCollection').take(1).toPromise().then(activeCollection => {
                if (activeCollection.$exists()) {
                    return Object.keys(activeCollection)[0]
                }
                else {
                    return null;
                }
            });
        }
    }

    getCurrentVulgeCollection(): Promise<FirebaseListObservable<any>> {
        //TODO determine if we want ActiveVulgeCollection be observable or promise.
        return this.getCurrentVulgeCollectionKey().then(collectionKey => {
            if (collectionKey) {
                return this.af.database.list(`/vulgeCollections/${collectionKey}/vulges`, { query: { orderByChild: 'votes', limitToLast: 25 } });
            }
        });

    }
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
        return this.getCurrentVulgeCollectionKey().then(collectionKey => {
            if (collectionKey) {
                return this.af.database.object(`/vulgeCollections/${collectionKey}/vulges/${vulgeKey}`, { preserveSnapshot: preserveSnapshot });
            }
        });

    }

    getUserNotificationCollection(userKey: string): FirebaseListObservable<any> {
        return this.af.database.list(`/userObjs/userNotifications/${userKey}`);
    }
}