import { PipeTransform, Pipe } from '@angular/core';
import { HelperService } from '../services';
@Pipe({ name: 'userVoteFilter' })
export class UserVotePipe implements PipeTransform {

    constructor(public helperService: HelperService) {

    }
    
    transform(input: any): any {
        return Array.isArray(input)
            ? input.map(item => {
                item.occured = this.helperService.getDateDiffFromNow(item.voteDate)
                return item;
            }).sort((a, b) => {
                return b.voteDate - a.voteDate;
            })
            : input;
    }
}