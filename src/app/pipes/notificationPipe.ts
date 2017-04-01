import { PipeTransform, Pipe } from '@angular/core';
import { NotificationType, NotificationModel } from '../viewModels'
import { HelperService } from '../services';
@Pipe({ name: 'notificationFilter' })
export class NotificationPipe implements PipeTransform {

  constructor(public helperService: HelperService) {

  }
  transform(input: any): any {
    return Array.isArray(input)
      ? input.filter(item => {
        return !item.hasSeen
      }).sort((a, b) => {
        return b.notifyDate - a.notifyDate;
      }).reduce((acc, curr) => {
        let group = acc.find(item => item.type === curr.type);
        if (group) {
          group.usersOfType.push(curr.createdBy)
        }
        else {
          curr.usersOfType = [curr.createdBy]
          acc.push(curr);
        }
        return acc;
      }, [])
        .map(item => {
          item.getNotificationClass = () => {
            //possible switch
            return {
              'bg-red-600': item.type === NotificationType.DownVote,
              'bg-green-600': item.type === NotificationType.UpVote,
              'fa-thumbs-o-up': item.type === NotificationType.UpVote,
              'fa-thumbs-o-down': item.type === NotificationType.DownVote
            }
          };
          item.occured = this.helperService.getDateDiffFromNow(item.notifyDate);
          let firstUser = item.usersOfType.shift();
          //TODO Filter out non unique users
          let othersString = item.usersOfType.length ? `and ${item.usersOfType.length} others have`: 'has';
          switch(item.type){
            case(NotificationType.UpVote):
                item.message = `${firstUser} ${othersString} up voted your vulge.`;
                break;
            case(NotificationType.DownVote):
                item.message = `${firstUser} ${othersString} down voted your vulge.`;
                break;
            default:
                item.message = 'Unkown';
          }       
          return item;
        })
      : input;
  }
}


