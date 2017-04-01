import { CursorModel } from './cursorModel';
export class VulgeCollectionSettingsModel {
    enableRealTime: boolean;
    sortBy: string;
    sortByOption: Array<string>;
    vulgeCount: number;
    numPages: number;
    currentPage: number;
    pageSize: number;
    pageCursors:Array<CursorModel>;
    constructor() {
        this.enableRealTime = true;
        this.sortBy = VulgeCollectionSortByOptions[VulgeCollectionSortByOptions.Votes];
        this.sortByOption = [VulgeCollectionSortByOptions[VulgeCollectionSortByOptions.Votes],
        VulgeCollectionSortByOptions[VulgeCollectionSortByOptions.Controversial], VulgeCollectionSortByOptions[VulgeCollectionSortByOptions.Newest]];
        this.pageCursors = [null];
        this.currentPage = 1;
        this.pageSize = 25;
    }
}

export enum VulgeCollectionSortByOptions {
    Votes,
    Controversial,
    Newest,
    Oldest
}


