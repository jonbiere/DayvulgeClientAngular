export class Notification {
    notifyUser:string;
    createdBy: string;
    message:string;
    notifyDate:Object;
    type:NotificationType;
    hasSeen:boolean;
    constructor(  notifyUser:string, createdBy:string, notifyDate:Object, type:NotificationType){
        this.notifyUser = notifyUser;
        this.createdBy = createdBy;
        this.notifyDate = notifyDate;
        this.type = type;
        this.hasSeen = false;
    }
}

export const enum NotificationType {
    UpVote,
    DownVote, 
}
