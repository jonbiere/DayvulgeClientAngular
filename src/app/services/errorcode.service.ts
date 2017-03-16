import { Injectable } from '@angular/core';

@Injectable()
export class ErrorCodeService {
    constructor() { }

    getErrorMessage(errorcode:ErrorCodes){
        switch(errorcode){
            case ErrorCodes["auth/internal-error"]:
                return "There was an error processing your request.";

            case ErrorCodes["auth/invalid-email"]:
                return "The email address is badly formatted.";

            case ErrorCodes["auth/user-not-found"]:
                return "There is no user found corresponding to this email.";

            case ErrorCodes["auth/wrong-auth-provider"]:
                return "This email signed up with a different provider. Sign in with Facebook or Google instead.";

            case ErrorCodes.user_no_votes:
                return "You've run out of votes for the day.";

            case ErrorCodes.user_create_account_to_vote:
                return "Please login or create an account to vote.";

            case ErrorCodes.internal_error:
                return "There was an error processing your request.";

            default:
                return "There was an error processing your request.";
        }
    }
}

export enum ErrorCodes{
   "auth/internal-error",
   "auth/invalid-email",
   "auth/user-not-found",
   "auth/wrong-auth-provider",
   "user_no_votes",
   "user_create_account_to_vote",
   "internal_error"
}