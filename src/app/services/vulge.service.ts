import { Injectable } from '@angular/core';
import { AngularFire} from 'angularfire2';
import {ErrorCodeService, ErrorCodes} from './errorcode.service';
import {ToasterService} from './toastr.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';

@Injectable()
export class VulgeService {

    private readonly path:string;
    constructor(public af: AngularFire, public errorCodeService:ErrorCodeService, public toastr:ToasterService, private http:Http) { 
        this.path = 'http://localhost:3001/api/vote';
    }

    public vote():firebase.Promise_Instance<Observable<any>> {
        return firebase.auth().currentUser.getToken(true).then(userToken =>{
            return this.http.post(this.path,{userToken:userToken})
                .map((resp: Response) => resp.json())
                .catch(this.handleError);
        },
        error =>{
            this.toastr.error(this.errorCodeService.getErrorMessage(ErrorCodes.internal_error));
        }
        );
    }

    private handleError(error: any) {
        this.toastr.error(this.errorCodeService.getErrorMessage(ErrorCodes.internal_error));
        return Observable.throw(error.json());
    }
}