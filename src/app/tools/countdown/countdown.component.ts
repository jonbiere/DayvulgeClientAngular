import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import * as moment from 'moment';
@Component({
    selector: 'countdown',
    templateUrl: 'countdown.component.html'
})
export class CountdownComponent implements OnInit {
    countdown:string;
    timerObs:Observable<number>;
    listners:Array<Subscription>;
    constructor(){
        this.listners = [];
        this.timerObs = Observable.interval(1000); 
    }

    ngOnInit() { 
        this.resetTimer();
    }

    resetTimer(){
        this.listners.forEach(item => {
            item.unsubscribe();
        });
        let endDate = this.getNextEndDate();
        this.listners.push(this.timerObs.subscribe(value =>{
            let duration = moment.duration(endDate.diff(moment()));
            this.countdown =  moment.utc(duration.asMilliseconds()).format('HH:mm:ss'); ////'HH [hours] mm [minutes] ss [seconds]'
            if(duration.asSeconds() < 1){
                this.resetTimer();
            }
        }))
    }

    getNextEndDate(){
       return moment().add((15-moment().minute() % 15), 'minute').set('second',0);
    }
}