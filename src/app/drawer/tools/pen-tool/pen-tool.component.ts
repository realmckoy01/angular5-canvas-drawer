import { Component, OnInit, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { DrPolygon, createDrPolygon, createDrPolyline } from '../../models/dr-polygon';
import { DataStoreService } from '../../services/data-store.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/of';
import { EditorToolType } from '../../models/enums';
import { DrPoint } from '../../models/dr-point';
import { DrStyle } from '../../models/dr-style';

const SIZER_SIZE: number = 8;
const HALF_SIZER: number = 4;
const DOUBLE_CLICK_TIME: number = 250;

const SNAP_ANGLES: number[] = [0, 45, 90, 135, 180, 225, 270, 315, 360];

@Component({
  selector: 'app-pen-tool',
  templateUrl: './pen-tool.component.html',
  styleUrls: ['./pen-tool.component.scss']
})
export class PenToolComponent implements OnInit {
  @Input()
  penDblClick: string = '';
  @Input()
  emitMouseEvents: boolean = false;
  @Input()
  public polygonStyle: DrStyle = null;
  @Input()
  public lineStyle: DrStyle = null;
  @Input()
  objectPreviewStyle: DrStyle = null;
  @Input()
  allowLines: boolean = true;
  @Input()
  autoSelectObjects: boolean = true;

  @Output()
  public mouseAction: EventEmitter<{ type: string, pt: any }> = new EventEmitter<{ type: string, pt: any }>();

  currentObject: DrPolygon = null;

  private _currentPt = null;
  private _clickPt = null;
  private _delay: any;

  private _lastEvent: any = null;

  private _modifierKeys: any = {
    shift: false,
    alt: false,
    control: false
  };

  constructor(private _dataService: DataStoreService) { }

  ngOnInit() {

  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(evt): void {
    if ((EditorToolType.PEN_TOOL === this._dataService.selectedTool)) {
      switch (evt.key) {
        case "Shift":
        case "Control":
        case "Alt":
          this._modifierKeys[evt.key.toLowerCase()] = true;
          this.onBackgroundMouseMove(this._lastEvent);

          break;
      }
    }

  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(evt): void {
    if ((EditorToolType.PEN_TOOL === this._dataService.selectedTool)) {
      switch (evt.key) {
        case "Shift":
        case "Control":
        case "Alt":
          this._modifierKeys[evt.key.toLowerCase()] = false;
          this.onBackgroundMouseMove(this._lastEvent);
          break;
        case "Escape":
          this.reset();
          break;
      }
    }
  }

  onResizerMouseMove(evt): void {
    evt.stopPropagation();
    evt.preventDefault();
    if (this._currentPt) {

      let pt: DrPoint = this.getActivePoint(this.getResizerX() + HALF_SIZER, this.getResizerY() + HALF_SIZER);

      Object.assign(this._currentPt, {
        x: pt.x,
        y: pt.y
      });
    }
    else {
      this._currentPt = this.getActivePoint(this.getResizerX() + HALF_SIZER, this.getResizerY() + HALF_SIZER);
      if (this.penDblClick.toLowerCase().trim() === 'complete') {
        this.currentObject.points.splice(this.currentObject.points.length - 1, 0, this._currentPt);
      } else {
        this.currentObject.points.push(this._currentPt);
      }
    }
  }

  onBackgroundMouseMove(evt): void {
    if (this.currentObject) {
      this._lastEvent = evt;
      if (this._delay) {
        if (this._currentPt) {
          if (this._currentPt.x !== evt.offsetX && this._currentPt.y !== evt.offsetY) {
            if (this._clickPt) {
              this.handleClick(this._clickPt.x, this._clickPt.y);
            }
          }
        }
      }
      else {
        if (this._currentPt) {
          let pt: DrPoint = this.getActivePoint(evt.offsetX, evt.offsetY);
          Object.assign(this._currentPt, {
            x: pt.x,
            y: pt.y
          });
        }
        else {
          this._currentPt = this.getActivePoint(evt.offsetX, evt.offsetY);

          if (this.penDblClick.toLowerCase().trim() === 'complete') {
            this.currentObject.points.splice(this.currentObject.points.length - 1, 0, this._currentPt);
          } else {
            this.currentObject.points.push(this._currentPt);
          }
        }
      }
      if (this.emitMouseEvents) {
        if (this._currentPt === null) {
          let emitPt = this.getActivePoint(evt.offsetX, evt.offsetY);
          this.mouseAction.next({ type: "mouseMove", pt: emitPt });
        } else {
          this.mouseAction.next({ type: "mouseMove", pt: this._currentPt });
        }
      }
    }
  }

  onBackgroundClick(evt): void {
    evt.stopPropagation();
    evt.preventDefault();

    if (this._delay) {
      if (this._delay) {
        this._delay.unsubscribe();
        this._delay = null;
      }
      if (this.currentObject) {
        if (this.penDblClick.toLowerCase().trim() === 'complete') {
          this.currentObject.points.splice(this.currentObject.points.length - 1, 0, this._currentPt);
        } else {
          this.currentObject.points.push(this.getActivePoint(evt.offsetX, evt.offsetY));
        }
        if (this.penDblClick.toLowerCase().trim() === 'clear') {
          this.reset();
        } else if (this.penDblClick.toLowerCase().trim() === 'complete') {
          this.completeObject(true);
        } else {
          this.completeObject(false);
        }
      }
    }
    else {
      this._clickPt = this.getActivePoint(evt.offsetX, evt.offsetY);;
      this._delay = Observable.of(null).delay(DOUBLE_CLICK_TIME).subscribe(() => {
        if (this._delay) {
          this.handleClick(this._clickPt.x, this._clickPt.y);
        }

      });
    }

  }

  onResizerClick(evt): void {
    evt.stopPropagation();
    this.completeObject(true);
  }

  getResizerX(): number {
    return this.currentObject.points[0].x - HALF_SIZER;
  }

  getResizerY(): number {
    return this.currentObject.points[0].y - HALF_SIZER;
  }

  finalize(): void {
    //Not Implemented
  }

  private handleClick(x: number, y: number): void {
    if (this._delay) {
      this._delay.unsubscribe();
      this._delay = null;
    }

    if (this.currentObject) {

      if (!this._currentPt) {
        if (this.penDblClick.toLowerCase().trim() === 'complete') {
          this.currentObject.points.splice(this.currentObject.points.length - 1, 0, { x: x, y: y });
        } else {
          this.currentObject.points.push({ x: x, y: y });
        }
      }

      this._currentPt = null;
    }
    else {
      let pts = [];
      if (this.penDblClick.toLowerCase().trim() === 'complete') {
        pts = [{ x: x, y: y }, { x: x, y: y }];
      } else {
        pts = [{ x: x, y: y }];
      }
      if (this.objectPreviewStyle) {
        this.currentObject = createDrPolyline({
          id: 1000000,
          name: this._dataService.getUniqueName("Polyline"),
          points: pts,
          ...this.objectPreviewStyle
        });
      } else {
        this.currentObject = createDrPolyline({
          id: 1000000,
          name: this._dataService.getUniqueName("Polyline"),
          points: pts
        });
      }
    }
    if (this.emitMouseEvents) {
      this.mouseAction.next({ type: "mouseClick", pt: { x: x, y: y } });
    }
  }

  private getActivePoint(x: number, y: number): DrPoint {
    let returnValue: DrPoint = { x: x, y: y };

    if (this._modifierKeys.shift && this.currentObject.points.length > 1) {
      let lastPoint: DrPoint = this.currentObject.points[this.currentObject.points.length - 2];

      let angle: number = (360 + this.getRotationAngle(lastPoint, returnValue)) % 360;

      let snapped: number[] = SNAP_ANGLES.slice(0);
      let snappedAngle: number = snapped.sort((a, b) => {
        return Math.abs(angle - a) - Math.abs(angle - b);
      })[0];

      let dist: number = Math.sqrt(Math.pow(Math.abs(returnValue.x - lastPoint.x), 2) +
        Math.pow(Math.abs(returnValue.y - lastPoint.y), 2));

      returnValue = this.pointOnLine(lastPoint.x, lastPoint.y, snappedAngle, dist);
    }

    return returnValue;
  }

  private pointOnLine(x: number, y: number, angle: number, distance: number): DrPoint {
    return {
      x: Math.round(Math.cos(angle * Math.PI / 180) * distance + x),
      y: Math.round(Math.sin(angle * Math.PI / 180) * distance + y)
    };
  }

  private getRotationAngle(a: DrPoint, b: DrPoint): number {
    return Math.round(Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI);
  }

  private getNextId(): number {
    return 0 === this._dataService.elements.length ? 1 :
      Math.max(...this._dataService.elements.map(o => o.id)) + 1;
  }

  private isStraightLineObject(): boolean {
    let returnValue = true;
    let currentPoints = [...this.currentObject.points.filter(x => x !== null)];
    //we don't care about closed objects in this function, make sure last point and first point don't match
    if (currentPoints[0].x === currentPoints[currentPoints.length - 1].x && currentPoints[0].y === currentPoints[currentPoints.length - 1].y) {
      currentPoints.splice(currentPoints.length - 1, 1);
    }
    //splice out dupes
    for (let i = (currentPoints.length - 1); i >= 1; i--) {
      if (currentPoints[i].x === currentPoints[i - 1].x && currentPoints[i].y === currentPoints[i - 1].y) {
        currentPoints.splice(i, 1);
      }
    }
    //then check out to see if slope changes at any point
    let currentSlope = null;
    for (let i = 0; i < (currentPoints.length - 1); i++) {
      let slope = ((currentPoints[i + 1].y - currentPoints[i].y) / (currentPoints[i + 1].x - currentPoints[i].x));
      if (currentSlope === null) {
        currentSlope = slope;
      } else {
        if (currentSlope != slope) {
          returnValue = false;
          break;
        }
      }
    }
    return returnValue;
  }

  private completeObject(isClosed: boolean): void {
    if (!this.allowLines) {
      let isStraightLine: boolean = this.isStraightLineObject();
      if (isStraightLine) {
        this.reset();
      } else if (!isStraightLine && !isClosed) {
        this.reset();
      }
    }
    if (this.currentObject !== null) {

      if (this.currentObject.points[this.currentObject.points.length - 1].x === this.currentObject.points[this.currentObject.points.length - 2].x &&
        this.currentObject.points[this.currentObject.points.length - 1].y === this.currentObject.points[this.currentObject.points.length - 2].y) {
        this.currentObject.points.splice(this.currentObject.points.length - 1, 1);
      }
      if (this.currentObject.points[0].x === this.currentObject.points[this.currentObject.points.length - 1].x && this.currentObject.points[0].y === this.currentObject.points[this.currentObject.points.length - 1].y && this.currentObject.points.length > 2 && !isClosed) {
        this.currentObject.points.splice(this.currentObject.points.length - 1, 1);
      }
      if (this.currentObject &&
        null !== this.currentObject &&
        this.currentObject.points.length > 1) {
        ;
        let newObject: DrPolygon
        if ((this.currentObject.points.length < 3 || (this.currentObject.points.length === 3
          && this.currentObject.points[0].x === this.currentObject.points[this.currentObject.points.length - 1].x
          && this.currentObject.points[0].y === this.currentObject.points[this.currentObject.points.length - 1].y))
          && this.penDblClick.toLowerCase().trim() === "complete" && isClosed) {
          this.reset();
        } else {
          if (this.currentObject.points.length > 3 && isClosed) {
            let polyProps;
            if (this.polygonStyle) {
              polyProps = { id: this.getNextId(), points: this.currentObject.points.slice(0, this.currentObject.points.length), name: "Polygon", ...this.polygonStyle };
            } else {
              polyProps = { id: this.getNextId(), points: this.currentObject.points.slice(0, this.currentObject.points.length), name: "Polygon" };
            }
            newObject = createDrPolygon(polyProps);
          }
          else {
            let lineProps;
            if (this.lineStyle) {
              lineProps = { id: this.getNextId(), points: this.currentObject.points, name: "Polyline", ...this.lineStyle };
            } else {
              lineProps = { id: this.getNextId(), points: this.currentObject.points, name: "Polyline" };
            }
            newObject = createDrPolyline(lineProps);
          }

          this._dataService.addObjects([
            newObject
          ]);
          if (this.polygonStyle && isClosed) {
            this._dataService.setStyles([newObject], this.polygonStyle)
          }
          if (this.lineStyle && !isClosed) {
            this._dataService.setStyles([newObject], this.lineStyle)
          }
          if (this.autoSelectObjects) {
            this._dataService.selectObjects([newObject]);
          }

        }
        this.reset();
      }
    }
  }

  private reset(): void {
    this.currentObject = null;
    this._currentPt = null;
    this._clickPt = null;
    if (this._delay) {
      this._delay.unsubscribe();
      this._delay = null;

    }
  }
}
