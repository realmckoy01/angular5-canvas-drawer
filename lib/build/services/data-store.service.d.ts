import { EventEmitter } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IDrawerAppState } from '../store';
import { DrObject } from '../models/dr-object';
import { BoundingBox } from '../models/bounding-box';
import { EditorToolType } from '../models/enums';
import { DrawerObjectHelperService } from '../services/drawer-object-helper.service';
import { ChangeHelperService } from './change-helper.service';
import { DrStyle } from '../models/dr-style';
import { DrGroupedObject } from '../models/dr-grouped-object';
export declare class DataStoreService {
    private _ngRedux;
    private _objectHelperService;
    private _changeService;
    undid: EventEmitter<void>;
    redid: EventEmitter<void>;
    selectionChanged: EventEmitter<DrObject[]>;
    editingChanged: EventEmitter<boolean>;
    objectsAdded: EventEmitter<DrObject[]>;
    private _duplicateOffset;
    constructor(_ngRedux: NgRedux<IDrawerAppState>, _objectHelperService: DrawerObjectHelperService, _changeService: ChangeHelperService);
    elements: DrObject[];
    readonly selectedObjects: DrObject[];
    readonly selectedBounds: BoundingBox;
    selectedTool: EditorToolType;
    readonly isEditing: boolean;
    moveObjects(items: DrObject[], newBounds: BoundingBox): void;
    setStyle(item: DrObject, newStyle: DrStyle): void;
    moveObjectDown(item: DrObject): void;
    moveObjectUp(item: DrObject): void;
    addObjects(items: DrObject[]): void;
    groupObjects(items: DrObject[]): void;
    ungroupObject(item: DrGroupedObject): void;
    removeObjects(items: DrObject[]): void;
    duplicateObjects(items: DrObject[]): void;
    clearObjects(): void;
    private getObjectIndex(item);
    private getNextId();
    selectObjects(items: DrObject[]): void;
    beginEdit(): void;
    endEdit(): void;
    undo(): void;
    redo(): void;
}
