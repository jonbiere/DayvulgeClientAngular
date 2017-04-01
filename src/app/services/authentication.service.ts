import { Injectable } from '@angular/core';
import { AngularFire, AuthProviders, AuthMethods, FirebaseAuthState } from 'angularfire2';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { ToasterService } from './toastr.service';
import { FirebaseRefService } from './firebaseRef.service';
import { ErrorCodeService, ErrorCodes } from './errorcode.service'
import { HelperService } from './helper.service';
import { ProfileModel } from '../viewModels';
import { AppSettings } from '../appSettings';
import * as firebase from 'firebase';

//declare var jQuery:any;
@Injectable()
export class AuthenticationService {
    currentuser: BehaviorSubject<firebase.User> = new BehaviorSubject<firebase.User>(null);

    constructor(public af: AngularFire, public toastr: ToasterService, public errorCodeService: ErrorCodeService, public firebaseRefService: FirebaseRefService, public helperService: HelperService) {
        af.auth.subscribe(authState => {
            if (!authState) {
                this.currentuser.next(null);
            }
            else if (authState.provider === AuthProviders.Password) {
                if (!authState.auth.emailVerified) {
                    this.currentuser.next(null);
                    this.toastr.info(`Pleave verify your account to continue. An email has been sent to ${authState.auth.email}`);
                }
                else {                 
                    this.currentuser.next(authState.auth);
                }
            }
            else {            
                this.createUserProfileIfNeeded(authState);
                this.currentuser.next(authState.auth);

            }
        });
    }

    login(provider: string, loginModel: any): firebase.Promise<FirebaseAuthState> {
        var authProvider: AuthProviders;
        var authMethod: AuthMethods;
        switch (provider) {
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

        if (authProvider != AuthProviders.Password) {
            return this.af.auth.login({
                provider: authProvider,
                method: authMethod
            }).catch(error =>{
                this.toastr.error(ErrorCodes[(error as any).code as string]);
                throw error;
            });
        }
        else {
            return this.af.auth.login(loginModel, {
                provider: authProvider,
                method: authMethod
            }).catch(error =>{
                this.toastr.error(ErrorCodes[(error as any).code as string]); 
                throw error;
            });;
        }


    }

    logout() {
        this.af.auth.logout();
    }

    createAccount(registerModel: any): Observable<FirebaseAuthState> {
        return Observable.fromPromise(<Promise<FirebaseAuthState>>this.af.auth.createUser(registerModel).then(authState => {
            this.createUserProfileIfNeeded(authState);
        }));
    }
    
    //todo this should be handled on the server
    createUserProfileIfNeeded(authState: FirebaseAuthState) {
        let user = authState.auth;
        this.firebaseRefService.getCurrentUserProfile(user.uid, false).take(1).subscribe(userProfile => {
            //set dayvulge user profile
            if (!userProfile.$exists()) {
                
                let newPofile = new ProfileModel(user.email, firebase.database['ServerValue']['TIMESTAMP'], AppSettings.VotesPerDay);
                this.firebaseRefService.getCurrentUserProfile(user.uid, false).set(newPofile);
            }
            //set firebase user profile
            if (authState.provider === AuthProviders.Password) {
                let displayName = user.email.split('@')[0];
                let letter = user.email[0].toLowerCase();
                let photoFile = this.helperService.isLetter(letter) ? letter : 'unknown';
                user.updateProfile({
                    displayName: displayName,
                    photoURL: `/assets/images/profile/${photoFile}.svg`
                });
            }

            if (authState.provider === AuthProviders.Facebook) {
                let fbData = user.providerData[0];
                user.updateProfile({
                    displayName: fbData.displayName,
                    photoURL: fbData.photoURL
                });
            }
        });
    }

    sendPasswordResetEmail(email: string): Observable<boolean> {
        var result: Observer<boolean>;
        let auth = firebase.auth();
        auth.fetchProvidersForEmail(email).then(providers => {
            if (providers && providers.length) {
                if (providers[0] === AuthProviders.Password || providers[0] === "password") {
                    return auth.sendPasswordResetEmail(email).then(sent => {
                        this.toastr.info(`An email has been sent to ${email}`);
                        result.next(true);
                    }, error => {
                        let e = error as any;
                        let code: string = e.code || 'auth/internal-error'
                        this.toastr.error(ErrorCodes[code]);
                        result.next(false);
                    });
                }
                else {
                    result.next(false);
                    this.toastr.error(ErrorCodes['auth/wrong-auth-provider']);
                }
            }
            else {
                result.next(false);
                this.toastr.error(ErrorCodes.reset_user_not_found);
            }
        },
            error => {
                this.toastr.error(ErrorCodes.internal_error);
                result.next(false);
            }
        );
        return Observable.create(observer => result = observer);
    }

    getCurrentUser(): BehaviorSubject<firebase.User> {
        return this.currentuser;
    }

}