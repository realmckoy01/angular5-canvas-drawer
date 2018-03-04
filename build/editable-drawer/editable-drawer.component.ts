import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DrObject } from '../models/dr-object';
import { DataStoreService } from '../services/data-store.service';

@Component({
  selector: 'app-editable-drawer',
  template: "\n    <app-drawer [handleMouseEvents]=\"false\">\n\n    </app-drawer>\n    <app-editor-tool>\n\n    </app-editor-tool>\n  ",
  styles: ["\n\n  "]
})
export class EditableDrawerComponent implements OnInit {

  @Output() 
  public selectionChanged: EventEmitter<DrObject[]> = new EventEmitter<DrObject[]>();

  @Output()
  public editingChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input()
  set elements(elements: DrObject[]) {
    this._dataService.elements = elements;
  }
  get elements(): DrObject[] { 
    return  this._dataService.elements;
  }

  constructor(private _dataService: DataStoreService) { }

  ngOnInit() {
    this._dataService.selectionChanged.subscribe((selectedObjects:DrObject[]) => {
      this.selectionChanged.emit(selectedObjects);
    });
    this._dataService.editingChanged.subscribe((isEditing: boolean) => {
      this.editingChanged.emit(isEditing);
    })
  }

}