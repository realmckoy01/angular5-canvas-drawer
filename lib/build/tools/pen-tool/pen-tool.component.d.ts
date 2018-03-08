import { OnInit } from '@angular/core';
import { DrPolygon } from '../../models/dr-polygon';
import { DataStoreService } from '../../services/data-store.service';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/of';
export declare class PenToolComponent implements OnInit {
    private _dataService;
    currentObject: DrPolygon;
    objectStyle: any;
    private _currentPt;
    private _clickPt;
    private _delay;
    constructor(_dataService: DataStoreService);
    ngOnInit(): void;
    onBackgroundMouseMove(evt: any): void;
    onBackgroundClick(evt: any): void;
    onResizerClick(evt: any): void;
    getResizerX(): number;
    getResizerY(): number;
    private handleClick(x, y);
    private completeObject();
}
