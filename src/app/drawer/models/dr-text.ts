import { DrRect, DEFAULT_RECT } from "./dr-rect";
import { DrTextAlignment } from "./dr-text-alignment.enum";
import { DrType } from "./dr-type.enum";

export interface DrText extends DrRect {

    text: string;
    fitText: boolean;
    bold: boolean;
    italic: boolean;
    size: number;
    fontFamily: string;
    fontColor: string;
    hAlignment: DrTextAlignment;
    vAlignment: DrTextAlignment; 
    showText: boolean;
    initial: boolean;
}

export const DEFAULT_TEXT: DrText = Object.assign({}, DEFAULT_RECT, {
    text: " ",
    fitText: false,
    bold: false,
    italic: false,
    showFill: false,
    showStroke: false,
    size: 16,
    fontFamily: 'Verdana',
    fontColor: '#000000',
    hAlignment: DrTextAlignment.NEAR,
    vAlignment: DrTextAlignment.NEAR,
    drType: DrType.TEXT,
    showText: true,
    initial: true
});

export function createDrText(properties: any): DrText {
    return  Object.assign({}, DEFAULT_TEXT, properties);
}