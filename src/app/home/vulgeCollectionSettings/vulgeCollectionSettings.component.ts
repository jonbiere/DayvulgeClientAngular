import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import {VulgeCollectionSettingsModel,VulgeCollectionSortByOptions} from '../../viewModels'

@Component({
    selector: 'vulge-collection-settings',
    templateUrl: 'vulgeCollectionSettings.component.html',
    styles: [require('./vulgeCollectionSettings.component.scss')],
    host:{        
        '(document:click)': 'closeFromOutsideClick($event)'
    }    
})
export class VulgeCollectionSettingsComponent implements OnInit {
    @Input() settingsModel: VulgeCollectionSettingsModel;
    @Output() changePage = new EventEmitter(); 
    @ViewChild('dropDownObj') dropDownObj: any;
    @ViewChild('vulgeSettingsElement') vulgeSettingsElement:any;
    @ViewChild('sortByDropDown') sortByDropDown:any;
    constructor() {
        
    }

    ngOnInit() {
     }

    closeFromOutsideClick($event){      
        if(this.dropDownObj && $event.button !== 2 && this.vulgeSettingsElement && this.vulgeSettingsElement.nativeElement && !this.vulgeSettingsElement.nativeElement.contains($event.target)
         &&  !!this.dropDownObj._toggleElement && !this.dropDownObj._toggleElement.contains($event.target) ){
            this.dropDownObj.close();     
        }        
    }
    toggleRealTime(){

    }

    setSortBy(option:string){
        this.settingsModel.sortBy = option;
        this.sortByDropDown.close();
    }

    nextPage(){
        if(this.settingsModel.currentPage < this.settingsModel.numPages){    
            this.settingsModel.currentPage++;                  
            this.changePage.emit(this.settingsModel.currentPage);
            
        }
    }

    previousPage(){
        if(this.settingsModel.currentPage != 1){  
            this.settingsModel.currentPage--;                   
            this.changePage.emit( this.settingsModel.currentPage);
            
        }
    }
}