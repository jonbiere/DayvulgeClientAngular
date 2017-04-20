import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'spinner',
    templateUrl: 'spinner.component.html'
})
export class SpinnerComponent {
    constructor() { }
    @Input() size: string;
}