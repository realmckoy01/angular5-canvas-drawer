import { OnInit, OnDestroy, ElementRef } from '@angular/core';
import { DataStoreService } from '../../services/data-store.service';
import { DrObject } from '../../models/dr-object';
import { DrRect } from '../../models/dr-rect';
import { DrawerObjectHelperService } from '../../services/drawer-object-helper.service';
import { MouseEventData } from '../../models/mouse-event-data';
import { ChangeHelperService } from '../../services/change-helper.service';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/of';
import { CustomComponentResolverService } from '../../services/custom-component-resolver.service';
export declare class SelectorToolComponent implements OnInit, OnDestroy {
    private _dataStoreService;
    private _objectHelperService;
    private _changeService;
    private _elementRef;
    private _customComponentResolverService;
    elementState: any;
    SIZER_SIZE: number;
    HALF_SIZER: number;
    sizers: number[];
    boundingBoxObjectUniqueId: number;
    canResize: boolean;
    canRotate: boolean;
    boundingBoxObject: DrRect;
    selectedObjects: DrObject[];
    selectionTransform: string;
    cssBounds: any;
    rotateRightBounds: any;
    rotateBottomBounds: any;
    cursor: string;
    rotation: number;
    mouseDownSizer: number;
    mouseDownRotator: number;
    mouseDown: boolean;
    keyDown: boolean;
    selectionStyle: any;
    invisibleStyle: any;
    private _location;
    private _subRedid;
    private _subUndid;
    private _subSelectionChanged;
    private _subSelectedBoundsChanged;
    private _cornerDistance;
    private _originalBounds;
    private _originX;
    private _originY;
    private _mouseDownClones;
    private _mouseDownLocation;
    private _mouseDownCentroid;
    private _modifierKeys;
    private _lastEvent;
    private _clickPt;
    private _delay;
    constructor(_dataStoreService: DataStoreService, _objectHelperService: DrawerObjectHelperService, _changeService: ChangeHelperService, _elementRef: ElementRef, _customComponentResolverService: CustomComponentResolverService);
    ngOnInit(): void;
    onKeyDown(evt: any): void;
    onKeyUp(evt: any): void;
    isShiftDown(): boolean;
    onBackgroundMouseDown(evt: any): void;
    onBackgroundMouseMove(evt: any): void;
    onBackgroundMouseUp(evt: any): void;
    onBoundsMouseDown(data: MouseEventData): void;
    onBoundsMouseMove(data: MouseEventData): void;
    onBoundsMouseUp(data: MouseEventData): void;
    onSelectionMouseDown(data: MouseEventData): void;
    onSelectionMouseMove(data: MouseEventData): void;
    onSelectionMouseUp(data: MouseEventData): void;
    onMouseDown(data: MouseEventData): void;
    onMouseMove(data: MouseEventData): void;
    onMouseUp(data: MouseEventData): void;
    onResizerMouseDown(evt: any, index: number): void;
    onResizerMouseMove(evt: any, index: number): void;
    onResizerMouseUp(evt: any, index: number): void;
    onRotateMouseDown(evt: any, index: number): void;
    onRotateMouseMove(evt: any, index: number): void;
    onRotateMouseUp(evt: any, index: number): void;
    getResizerX(index: number): number;
    getResizerY(index: number): number;
    getResizerCursor(index: number): string;
    shouldPreserveAspectRatio(): boolean;
    pixelizeBounds(bounds: any): any;
    finalize(): void;
    private microMoveObjects(diffX, diffY);
    private getDistanceBetweenTwoPoints(point1, point2);
    private getRelativeChildPointFromEvent(evt);
    private getRelativePointFromEvent(evt);
    private canAllResize(objects);
    private setupBounds();
    private rotateObject(location, shiftKey);
    private getRotationAngle(a, b);
    private getRotationAngleFromMouseDownPoint(location);
    private resizeObjects(location, preserveAspectRatio);
    private resizeH(b, location, opposite, shiftKey, stationaryPt, quadrantMultiplier);
    private resizeV(b, location, opposite, shiftKey, stationaryPt, quadrantMultiplier);
    private getRotatedPoint(point, originX, originY, angle);
    private applyResizeChanges();
    ngOnDestroy(): void;
}
