import { Injectable } from '@angular/core';

@Injectable()
export class ErrorCodeService {
    constructor() { }

    getErrorMessage(errorcode){
        switch(errorcode){
            case "auth/internal-error":
                return "There was an error processing your request.";
            case "auth/invalid-email":
                return "The email address is badly formatted.";
            case "auth/user-not-found":
                return "There is no user found corresponding to this email.";
            case "auth/wrong-auth-provider":
                return "This email signed up with a different provider. Sign in with Facebook or Google instead.";
            default:
                return "There was an error processing your request.";
        }
    }

    public static AppErrors = {
        NO_VOTES: "You've run out of votes for the day.",
        CREATE_ACCOUNT_TO_VOTE: "Please login or create an account to vote."
    }

}