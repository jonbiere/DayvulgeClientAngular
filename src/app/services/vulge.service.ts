import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { ErrorCodeService, ErrorCodes } from './errorcode.service';
import { ToasterService } from './toastr.service';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';

@Injectable()
export class VulgeService {

    private readonly path: string;
    constructor(public af: AngularFire, public errorCodeService: ErrorCodeService, public toastr: ToasterService, private http: Http) {
        this.path = 'http://localhost:3001/api/vote';
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
                this.toastr.error(this.errorCodeService.getErrorMessage(ErrorCodes.internal_error));
                return Observable.throw(error.json());
            });
        },
            error => {
                this.toastr.error(this.errorCodeService.getErrorMessage(ErrorCodes.internal_error));
            }
        );
    }
}