export class VulgeCollectionSettingsModel {
   enableRealTime:boolean;
   sortBy:string;
   sortByOption:Array<string>;
   constructor(){
       this.enableRealTime = true;
       this.sortBy = VulgeCollectionSortByOptions[VulgeCollectionSortByOptions.Votes];
       this.sortByOption = [VulgeCollectionSortByOptions[VulgeCollectionSortByOptions.Votes], 
       VulgeCollectionSortByOptions[VulgeCollectionSortByOptions.Controversial],VulgeCollectionSortByOptions[VulgeCollectionSortByOptions.Newest]];
   }
}

export enum VulgeCollectionSortByOptions{
    Votes,
    Controversial,
    Newest,
    Oldest
}


