import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { ErrorCodes } from './errorcode.service';
import { ToasterService } from './toastr.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import {VulgeCollectionSettingsModel,VulgeCollectionSortByOptions} from '../viewModels';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { AppSettings } from '../appSettings';

@Injectable()
export class VulgeService {
    private settingsModel:VulgeCollectionSettingsModel;
    private readonly path: string;
    constructor(public af: AngularFire, public toastr: ToasterService, private http: Http) {
        this.path = `${AppSettings.API_BaseUrl}/api/vote`;       
        this.settingsModel = new VulgeCollectionSettingsModel();
    }
    public vote(vulgeKey: string, up: boolean): firebase.Promise_Instance<Observable<any>> {
        return firebase.auth().currentUser.getToken(false).then(userToken => {
            return this.http.post(this.path,
                {
                    userToken: userToken,
                    vulgeKey: vulgeKey,
                    up: up
                }
            ).map((resp: Response) => resp.json())
            .catch((error: any)=>{
                this.toastr.error(ErrorCodes.internal_error);
                return Observable.throw(error.json());
            });
        },
            error => {
                this.toastr.error(ErrorCodes.internal_error);
            }
        );
    }

    public getCollectionSettings(){
         this.settingsModel = this.settingsModel || new VulgeCollectionSettingsModel();
         return this.settingsModel;
    }
}