import { Component, OnInit, OnDestroy } from '@angular/core';

import { DataStoreService } from '../../services/data-store.service';
import { DrObject } from '../../models/dr-object';
import { select } from '@angular-redux/store';
import { createDrRect, DrRect } from '../../models/dr-rect';
import { DynamicSvgDirective } from '../../dynamic-svg/dynamic-svg.directive';
import { DrawerObjectHelperService } from '../../services/drawer-object-helper.service';
import { BoundingBox } from '../../models/bounding-box';
import { MouseEventData } from '../../models/mouse-event-data';
import { DrPoint } from '../../models/dr-point';
import { ChangeHelperService } from '../../services/change-helper.service';


const SIZER_SIZE: number = 8;
const HALF_SIZER: number = 4;

@Component({
  selector: 'app-selector-tool',
  templateUrl: './selector-tool.component.html',
  styleUrls: ['./selector-tool.component.scss']
})
export class SelectorToolComponent implements OnInit, OnDestroy {

  @select() elementState;

  //Dummy array to use in the ngFor
  sizers: number[] = [0,1,2,3,4,5,6,7];

  boundingBoxObjectUniqueId: number = 1000000;

  boundingBoxObject: DrRect = null;
  selectedObjects: DrObject[] = [];
  selectionTransform: string = null;
  cssBounds: any = null;
  cursor: string = 'grabber';

  invisibleStyle: any = {
    showFill: false,
    showStroke: false
  };

  selectionStyle: any = {
    showFill: true,
    fill: "rgba(255, 0, 0, 0.3)",
    dashedLine: false,
    showStroke: true,
    stroke: 'red',
    strokeWidth: 1

  };

  private _subRedid: any;
  private _subUndid: any;

  private _mouseDownClones: DrObject[] = null;
  private _mouseDownLocation: DrPoint = null;
  private _mouseDown: boolean = false;
  private _mouseDownSizer: number = -1;

  constructor(
    private _dataStoreService: DataStoreService,
    private _objectHelperService: DrawerObjectHelperService,
    private  _changeService: ChangeHelperService) { }

  ngOnInit() {
    this._subRedid = this._dataStoreService.redid.subscribe(() => {
      this.setupBounds();  
    });

    this._subUndid = this._dataStoreService.undid.subscribe(() => {
      this.setupBounds();
    });

    this.setupBounds();
  }

  onBackgroundMouseDown(evt): void {
    this.onMouseDown({ location: { x: evt.clientX, y: evt.clientY }, data: this.boundingBoxObject });
  }

  onBackgroundMouseMove(evt): void {
    this.onMouseMove({ location: { x: evt.clientX, y: evt.clientY }, data: this.boundingBoxObject });
  }

  onBackgroundMouseUp(evt): void {
    this.onMouseUp({ location: { x: evt.clientX, y: evt.clientY }, data: this.boundingBoxObject });
  }

  onMouseDown(data: MouseEventData): void {
    
    if (null === data.data || !data.data.clickable) {
      this._dataStoreService.selectObjects([]);
      this.setupBounds();
    }
    else {
      if (data.data.id !== this.boundingBoxObjectUniqueId) {
        //Not the selected bounds object
        if (1 === this._dataStoreService.selectedObjects.length) {
          if (this._dataStoreService.selectedObjects[0].id !== data.data.id) {
            this._dataStoreService.selectObjects([data.data]);
          }
        }
        else {
          this._dataStoreService.selectObjects([data.data]);
        }
  
        if (null !== this._dataStoreService.selectedBounds) {
          this.setupBounds();
        }
      }
      
    }
    
    if (this._dataStoreService.selectedObjects.length > 0) {
      this._dataStoreService.beginEdit();
      this._mouseDownLocation = data.location;
      this._mouseDown = true;
      this._mouseDownSizer = -1;
      this.cursor = "grabbing";
    }
    
  }

  onMouseMove(data: MouseEventData): void {
    if (this._mouseDown && this._dataStoreService.selectedObjects.length > 0) {
      if (this._mouseDownSizer < 0) {
        //Moving objects
        Object.assign(this.cssBounds, {
          left: this.boundingBoxObject.x - HALF_SIZER + (data.location.x - this._mouseDownLocation.x),
          top: this.boundingBoxObject.y - HALF_SIZER + (data.location.y - this._mouseDownLocation.y)
        });
      }
      else {
        //Resizing objects
        this.resizeObjects(data.location);
      }
      
    }
  }

  onMouseUp(data: MouseEventData): void {
    if (this._mouseDown && this._dataStoreService.selectedObjects.length > 0) {
      if (this._mouseDownSizer < 0) {
        //Moving objects
        Object.assign(this.cssBounds, {
          left: this.boundingBoxObject.x - HALF_SIZER + (data.location.x - this._mouseDownLocation.x),
          top: this.boundingBoxObject.y - HALF_SIZER + (data.location.y - this._mouseDownLocation.y)
        });
      }
      else {
        //Resizing Objects
        this.resizeObjects(data.location);
      }
      if (1 === this._dataStoreService.selectedObjects.length) {
        this._dataStoreService.moveObject(this._dataStoreService.selectedObjects[0], {
          x: this.cssBounds.left + HALF_SIZER,
          y: this.cssBounds.top + HALF_SIZER,
          width: this.cssBounds.width - SIZER_SIZE,
          height: this.cssBounds.height - SIZER_SIZE
        });
        this.setupBounds(); 
      }

      this.cursor = "grabber";
      this._mouseDown = false;
      this._mouseDownSizer = -1;
      this._dataStoreService.endEdit();
    }
    
  }

  onResizerMouseDown(evt: any, index: number): void {
    evt.stopPropagation();

    this._dataStoreService.beginEdit();
    this._mouseDownLocation = { x: evt.clientX, y: evt.clientY }
    this._mouseDown = true;
    this._mouseDownSizer = index;
    this.cursor = this.getResizerCursor(index);
    this._mouseDownClones = this._dataStoreService.selectedObjects.map((x) => Object.assign({}, x));
  }

  onResizerMouseMove(evt: any, index: number): void {
    evt.stopPropagation();

    if (this._mouseDownSizer >= 0 &&
        this._mouseDown) {
      
      this.resizeObjects({ x: evt.clientX, y: evt.clientY });
    }
  }

  onResizerMouseUp(evt: any, index: number): void {
    evt.stopPropagation();

    this.resizeObjects({ x: evt.clientX, y: evt.clientY });
    if (1 === this._dataStoreService.selectedObjects.length) {
      this._dataStoreService.moveObject(this._dataStoreService.selectedObjects[0], {
        x: this.cssBounds.left + HALF_SIZER,
        y: this.cssBounds.top + HALF_SIZER,
        width: this.cssBounds.width - SIZER_SIZE,
        height: this.cssBounds.height - SIZER_SIZE
      });
      this.setupBounds(); 
    }
    this.cursor = "grabber";
    this._mouseDownSizer = -1
    this._mouseDown = false;
    this._dataStoreService.endEdit();
  }

  getResizerX(index: number): number {
    switch(index) {
      case 0:
      case 1:
      case 2:
        return this.boundingBoxObject.x - HALF_SIZER;
      case 3:
      case 7:
        return this.boundingBoxObject.x + this.boundingBoxObject.width / 2 - HALF_SIZER
      case 4:
      case 5: 
      case 6:
        return  this.boundingBoxObject.x + this.boundingBoxObject.width - HALF_SIZER;
    }
  }

  getResizerY(index: number): number {
    switch(index) {
      case 0:
      case 6:
      case 7:
        return this.boundingBoxObject.y - HALF_SIZER;
      case 1:
      case 5:
        return this.boundingBoxObject.y + this.boundingBoxObject.height / 2 - HALF_SIZER;
      case 2:
      case 3:
      case 4:
        return  this.boundingBoxObject.y + this.boundingBoxObject.height - HALF_SIZER;
    }
  }

  getResizerCursor(index: number): string {
    switch(index) {
      case 0:
      case 4:
        return 'resizer-diagonal-2';
      case 2:
      case 6:
        return 'resizer-diagonal-1';
      case 1:
      case 5:
        return 'resizer-left-right';
      case 3:
      case 7:
        return 'resizer-top-bottom';
    }
  }

  private setupBounds(): void {
    if (null !== this._dataStoreService.selectedBounds) {
      this.selectedObjects = this._dataStoreService.selectedObjects.map(x => Object.assign({}, x));
      let b: BoundingBox = this._dataStoreService.selectedBounds;
      this.boundingBoxObject = createDrRect({
        id: this.boundingBoxObjectUniqueId,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        showFill: false,
        showStroke: true,
        stroke: 'red',
        dashedLine: false
      });
      this.selectionTransform = "translate(" + (b.x * -1 + HALF_SIZER) + " " + (b.y * -1 + HALF_SIZER) + ")";

      this.cssBounds = {
        left: b.x - HALF_SIZER,
        top: b.y - HALF_SIZER,
        width: b.width + SIZER_SIZE,
        height: b.height + SIZER_SIZE
      }
    }
    else {
      this.selectedObjects = [];
      this.boundingBoxObject = null;
      this.selectionTransform = "translate(0 0)";
      this.cssBounds = null;
    }
    
  }

  private resizeObjects(location: DrPoint): void {
    let b: BoundingBox = this._dataStoreService.selectedBounds;

    switch(this._mouseDownSizer){
      case 0:
        break;
      case 1: 
        this.resizeH(b, location, false);
        break;
      case 3:
        this.resizeV(b, location, true);
        break;
      case 5: 
        this.resizeH(b, location, true);
        break;
      case 7:
        this.resizeV(b, location, false);
    }

    
  }

  private resizeH(b: BoundingBox, location: DrPoint, opposite: boolean): void {

    let currentX: number = (opposite ? b.x + b.width : b.x) + (location.x - this._mouseDownLocation.x);
    let left: number = 0;
    let width: number = 0;
    let elementWidth: number = 0
    let threshold: number = opposite ? b.x : b.x + b.width;

    if (location.x < threshold) {
      left = currentX - HALF_SIZER;
      width = threshold + HALF_SIZER - left;
      elementWidth = threshold - currentX;
    }
    else {
      left = threshold - HALF_SIZER;
      width = currentX + HALF_SIZER - left;
      elementWidth = currentX - threshold;
    }
    
    if (width > 0 && elementWidth > 0) {
      Object.assign(this.cssBounds, {
        left: left,
        width: width
      });
      Object.assign(this.boundingBoxObject, {
        width: elementWidth
      });
      this.applyResizeChanges();
    }
  }

  private resizeV(b: BoundingBox, location: DrPoint, opposite: boolean): void {

    let currentY: number = (opposite ? b.y + b.height : b.y) + (location.y - this._mouseDownLocation.y);

    let top: number = 0;
    let height: number = 0;
    let elementHeight: number = 0;
    let threshold: number = opposite ? b.y : b.y + b.height;

    if (location.y < threshold) {
      top = currentY - HALF_SIZER;
      height = threshold + SIZER_SIZE - top;
      elementHeight = threshold - currentY;
    }
    else {
      top = threshold - HALF_SIZER;
      height = currentY + HALF_SIZER - top;
      elementHeight = currentY - threshold;
    }
    
    if (height > 0 && elementHeight > 0) {
      Object.assign(this.cssBounds, {
        top: top,
        height: height
      });
      Object.assign(this.boundingBoxObject, {
        height: elementHeight
      });
      this.applyResizeChanges();
    }
  }

  private applyResizeChanges(): void {
    for(let s of this.selectedObjects) {
      Object.assign(s, this._changeService.getBoundsChanges(
        s, 
        this._objectHelperService.getBoundingBox([this.boundingBoxObject]), 
        this._objectHelperService.getBoundingBox([this._mouseDownClones.find((t: any) => t.id === s.id)])
      ));
    }
  }

  ngOnDestroy() {

    if (this._subRedid) {
      this._subRedid.unsubscribe();
    }
    if (this._subUndid) {
      this._subUndid.unsubscribe();
    }
  }
}
