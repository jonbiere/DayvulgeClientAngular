import { Injectable } from '@angular/core';
import { AngularFire, AuthProviders, AuthMethods, FirebaseAuthState} from 'angularfire2';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { ToasterService,  } from './toastr.service';
import { VulgeService } from './vulge.service';
import {ErrorCodeService} from './errorcode.service'
import {Profile} from '../viewModels';
import {AppSettings} from '../appSettings';
import * as firebase from 'firebase';

declare var jQuery:any;
@Injectable()
export class AuthenticationService {
    currentuser:BehaviorSubject<firebase.User> = new BehaviorSubject<firebase.User>(null);

    constructor(public af: AngularFire, public toastr:ToasterService, public errorCodeService: ErrorCodeService, public vulgeServie: VulgeService) {
        af.auth.subscribe(authState => {
            if(!authState){
                this.currentuser.next(null);
            }
            else if(authState.provider === AuthProviders.Password){
                if(!authState.auth.emailVerified){
                    this.currentuser.next(null);
                    this.toastr.info(`Pleave verify your account to continue. An email has been sent to ${authState.auth.email}`);
                }
                else{
                    jQuery('#loginModal').modal('hide');
                    this.currentuser.next(authState.auth);
                    this.createUserProfileIfNeeded(authState.auth);
                }
            } 
            else{
                jQuery('#loginModal').modal('hide');
                this.currentuser.next(authState.auth);
                this.createUserProfileIfNeeded(authState.auth);
            }   
        });
     }

     login(provider:string, loginModel:any):firebase.Promise<FirebaseAuthState>{
        var authProvider: AuthProviders;
        var authMethod: AuthMethods;
        switch(provider){
            case 'facebook':
                authProvider = AuthProviders.Facebook;
                authMethod = AuthMethods.Redirect;
            break;
            case 'google':
                authProvider = AuthProviders.Google;
                authMethod = AuthMethods.Redirect;
            break;
            case 'email':
                authProvider = AuthProviders.Password;
                authMethod = AuthMethods.Password;
            break;
            default:
                return;
        }
        
        if(authProvider != AuthProviders.Password){
            return this.af.auth.login({
                provider: authProvider,
                method: authMethod
            });
        }
        else{
            return this.af.auth.login(loginModel, {
                provider: authProvider,
                method: authMethod
            });
        }

        
     }

     logout(){
         this.af.auth.logout();
     }

     createAccount(registerModel:any):Observable<FirebaseAuthState>{
        return Observable.fromPromise(<Promise<FirebaseAuthState>> this.af.auth.createUser(registerModel));
     }

     createUserProfileIfNeeded(user:firebase.User){
        this.vulgeServie.getCurrentUserProfile(user.uid, true).take(1).subscribe(userProfile => {
            if(!userProfile.val()){
                let newPofile = new Profile(user.email, firebase.database['ServerValue']['TIMESTAMP'], AppSettings.VotesPerDay);
                this.vulgeServie.getCurrentUserProfile(user.uid, false).set(newPofile);
            }
        });       
    }

     sendPasswordResetEmail(email:string):Observable<boolean>{
        var result:Observer<boolean>;
        let auth = firebase.auth();
        auth.fetchProvidersForEmail(email).then( providers => {       
            if(providers && providers.length){
                if(providers[0] === AuthProviders.Password || providers[0] === "password"){
                    return auth.sendPasswordResetEmail(email).then(sent =>{
                        this.toastr.info(`An email has been sent to ${email}`);
                        result.next(true);
                    }, error => {
                        var e = error as any;
                        this.toastr.error(this.errorCodeService.getErrorMessage(e.code));
                        result.next(false);
                    });
                }
                else{
                    result.next(false);
                    this.toastr.error(this.errorCodeService.getErrorMessage('auth/wrong-auth-provider'));
                }
            } 
            else{
                result.next(false);
                this.toastr.error(this.errorCodeService.getErrorMessage('auth/user-not-found'));
            }           
        },
          error => {  
            this.toastr.error(error.message);
            result.next(false);
          }
        );
        return Observable.create(observer => result = observer);
     }

     getCurrentUser():BehaviorSubject<firebase.User>{
        return this.currentuser;
     }

}