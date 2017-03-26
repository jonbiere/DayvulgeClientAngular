import { Injectable } from '@angular/core';
import * as toastrObj from 'toastr';
import { ErrorCodeService, ErrorCodes } from './errorcode.service';

@Injectable()
export class ToasterService {
    toastrOptions: ToastrOptions;
    toastr: Toastr
    constructor(public errorCodeService: ErrorCodeService) {
        this.toastr = toastrObj;
        this.toastrOptions = {
            closeButton: false,
            debug: false,
            newestOnTop: false,
            progressBar: false,
            positionClass: "toast-top-right",
            preventDuplicates: false,
            onclick: null,
            showDuration: 300,
            hideDuration: 1000,
            timeOut: 5000,
            extendedTimeOut: 1000,
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
        };
        this.toastr.options = this.toastrOptions;
    }

    info(message){
        this.toastr.info(message)
    }
        //toastr.options = 
    warning(errorCode:ErrorCodes, messageText?:string){
         let message = messageText || this.errorCodeService.getErrorMessage(errorCode);
        this.toastr.warning(message);
    }

    success(message, title){
        this.toastr.success(message, title);
    }

    error(errorCode:ErrorCodes, messageText?:string){
        let message = messageText || this.errorCodeService.getErrorMessage(errorCode);
        this.toastr.error(message);
    }

    clear(){
        this.toastr.clear();
    }
}

