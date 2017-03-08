export class UserVote {
    vulgeUserName: string;
    profilePic: string;
    vulgeText: string;
    voteDate: Object;
    numUpVotes: number;
    numDownVotes: number;
    constructor(vulgeUsername:string, profilePic:string, vulgeText:string, voteDate:Object, numUpVotes:number, numDownVotes:number) {
        this.vulgeUserName = vulgeUsername;
        this.profilePic = profilePic;
        this.vulgeText = vulgeText;
        this.voteDate = voteDate;
        this.numDownVotes = numDownVotes;
        this.numUpVotes = numUpVotes;
    }
    
}