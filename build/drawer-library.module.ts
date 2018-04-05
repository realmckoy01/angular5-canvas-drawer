import { NgModule, ModuleWithProviders, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgRedux, NgReduxModule } from '@angular-redux/store';


import { DrawerModule } from './drawer/drawer.module';
import { IDrawerAppState, rootReducer, INITIAL_STATE, undoableElementsReducer } from './store';
import { EditorModule } from './tools/editor.module';
import { EditableDrawerComponent } from './editable-drawer/editable-drawer.component';
import { EditableDrawerModule } from './editable-drawer/editable-drawer.module';
import { DrawerComponent } from './drawer/drawer.component';
import { PreviewComponent } from './preview/preview.component';
import { DrCalloutComponent } from './dr-callout/dr-callout.component';

export { DrPoint } from './models/dr-point';
export { DrObject } from './models/dr-object';
export { DrPolygon, createDrPolygon, createDrPolygonArrow, createDrPolygonCallout, createDrPolygonStar, createDrPolygonTriangle } from './models/dr-polygon';
export { DrEllipse, createDrEllipse } from './models/dr-ellipse';
export { DrRect, createDrRect } from './models/dr-rect';
export { DrType } from './models/dr-type.enum';
export { DrText, createDrText } from './models/dr-text';
export { DrImage, createDrImage } from './models/dr-image';
export { DrTextAlignment } from './models/dr-text-alignment.enum';
export { DrawerObjectHelperService } from './services/drawer-object-helper.service';
export { DataStoreService } from './services/data-store.service';
export { ChangeHelperService } from './services/change-helper.service';
export { EditorToolType } from './models/enums';
export { DrStyle, createDrStyle } from './models/dr-style';
export { DrTextStyle, createDrTextStyle } from './models/dr-text-style';
export { DrGroupedObject, createDrGroupedObject } from './models/dr-grouped-object'

@NgModule({
  imports: [
    CommonModule,
    EditableDrawerModule.forRoot(),
    DrawerModule.forRoot(),
  ],
  exports: [
    NgReduxModule,
    EditableDrawerComponent,
    DrawerComponent,
    PreviewComponent
  ],
  declarations: [DrCalloutComponent],
})
export class DrawerLibraryRootModule {
  constructor(ngRedux: NgRedux<IDrawerAppState>) {
    ngRedux.configureStore(rootReducer, INITIAL_STATE);
    
  }
 }

@NgModule({imports: [DrawerModule.forRoot(), CommonModule], exports: [CommonModule, NgReduxModule]})
export class DrawerLibraryModule {
  static forRoot(): ModuleWithProviders { return {ngModule: DrawerLibraryRootModule}; }
}