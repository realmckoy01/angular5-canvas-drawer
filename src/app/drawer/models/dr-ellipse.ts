import { DrObject, DEFAULT_OBJECT } from "./dr-object";
import { DrType } from "./dr-type.enum";
import { DrStyledObject, DEFAULT_STYLED_OBJECT } from "./dr-styled-object";

export interface DrEllipse extends DrStyledObject {

    x: number;
    y: number;
    rx: number;
    ry: number;
    
}

export const DEFAULT_ELLIPSE: DrEllipse = Object.assign({}, DEFAULT_STYLED_OBJECT, {
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
    drType: DrType.ELLIPSE
});

export function createDrEllipse(properties: any): DrEllipse {
    return  Object.assign({}, DEFAULT_ELLIPSE, properties);
}