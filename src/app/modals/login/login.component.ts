import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthenticationService } from '../../services';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'login',
    template: require('./login.component.html'),
    styles: [require('./login.component.scss')],
})
export class LoginComponent implements OnInit {
    loginModel:any = {};
    registerModel:any = {};
    showRegister:boolean = false;
    showSpinner:boolean = false;
    showPasswordReset:boolean = false;
    errorMessage:string;
    resetEmail:string
    constructor(public authService: AuthenticationService, public changeDetector: ChangeDetectorRef, public activeModal: NgbActiveModal) { 
    }
    

    ngOnInit() { 
    }

    login(provider:string){
        this.showSpinner = true;
        this.authService.login(provider, this.loginModel).then(authState => {
            if(authState){
                this.errorMessage = null;
                this.loginModel = {};
                this.toggleSpinner(false);
            }
        }, error => {
            this.errorMessage = error.message; 
            this.toggleSpinner(false);
        });
    }

    registerAccount(event:Event){
        event.preventDefault();
        this.showSpinner = true;
        
        this.authService.createAccount(this.registerModel).subscribe(authState => {
            this.toggleSpinner(false);
            this.toggleRegister(false);
            authState.auth.sendEmailVerification();
        }, error => {
            this.errorMessage = error.message; 
            this.toggleSpinner(false);
        });
    }

    resetPassword(event:Event){
        event.preventDefault();
         this.toggleSpinner(true);
    
        this.authService.sendPasswordResetEmail(this.resetEmail).subscribe(result => {
            if(result){
                this.toggleSpinner(false);
                this.togglePasswordReset(false);
            }
            else{
                this.toggleSpinner(false);
            }
        });
    }
    
    togglePasswordReset(value){
        this.showPasswordReset = value;
        this.resetEmail=null;
        this.changeDetector.detectChanges()
    }

    toggleSpinner(value){
        this.showSpinner = value; 
        this.changeDetector.detectChanges()
    }

    toggleRegister(value){
        this.registerModel = {};
        this.errorMessage = null;
        this.showPasswordReset = false;
        this.showRegister = value;
        this.changeDetector.detectChanges()
    }
}