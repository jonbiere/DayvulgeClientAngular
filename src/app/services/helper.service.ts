import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class HelperService {

    constructor() { }
    
    getDateDiffFromNow(date:any){
    var diff = Math.abs(moment(date).diff(moment(), 'seconds'));
    if(diff < 60){
      var unit = diff > 1 ? 'seconds' : 'second';  
    }
    else if(diff < 3600 && diff >= 60){
      diff = Number((diff/60).toFixed(1)); 
      var unit = diff > 1 ? 'minutes' : 'minute';    
    }
    else{
      diff = Number((diff/3600).toFixed(1));
      var unit = diff > 1 ? 'hours' : 'hour';
    }
    return `${diff} ${unit} ago`;
  }

  getArrayOfNLenth(length:number){
        return Array(length).fill(1);
  }
    
}