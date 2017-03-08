import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'profile',
    template: require('./profile.component.html'),
    styles: [require('./profile.component.scss')]
})
export class ProfileComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}