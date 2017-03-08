export class Profile {
    email: string;
    createdDate: Object;
    votes: number;
    constructor(email:string, createDate:Object, votes:number){
        this.email =email;
        this.createdDate = createDate;
        this.votes = votes;
    }
}