import { Injectable } from '@angular/core';
import { TextInfo } from '../models/text-info';

import * as d3Plus from 'd3plus-text';
import { DrText } from '../models/dr-text';

export const SPACE_PLACEHOLDER: string = "~";
export const PIPE_CHAR_PLACEHOLDER: string = "`";
export const TEXT_PADDING: number = 4;

export const LINE_HEIGHT_RATIO: number = 1.618;



@Injectable()
export class TextRenderingService {

  constructor() { }

  undoHtmlText(html: string): string {
    let returnValue: string = html
    .replace(/<div><span/g, "<span")
    .replace(/<\/span><br>/g, "")
    .replace(/<div><br><\/div>/g, "\n")
    .replace(/<br>/g, "\n")
    .replace(/<div>/g, "\n")
    .replace(/<\/div>/g, "")
    .replace(/<\/span>/g, "")
    .replace(/&nbsp;/g, " ");
    let idx: number = returnValue.indexOf("<span");
    let endIdx: number;
    while(idx >= 0) {
      endIdx = returnValue.indexOf(">", idx);
      returnValue = returnValue.substring(0, idx) + returnValue.substring(endIdx + 1);
      idx = returnValue.indexOf("<span");
    }
    returnValue = returnValue
    .replace(/&amp;/, "&")
    .replace(/&gt;/, ">")
    .replace(/&lt;/, "<");
    return returnValue;
  }

  getDivText(d: DrText): string {
    let c: any = d3Plus.textWrap()
      .fontFamily(d.fontFamily)
      .fontSize(d.size)
      .fontWeight(d.bold ? 'bold' : 'normal')
      .width(d.width - 2 * TEXT_PADDING);

      let userLineBreaks: string[] = d.text.split("\n");

      let returnValue: string = "";

      let spaceExp: RegExp = new RegExp(SPACE_PLACEHOLDER + " ", "g");
      let pipeCharExp: RegExp = new RegExp(PIPE_CHAR_PLACEHOLDER, "g");

      let u;
      let w: number;
      let prevHasDiv: boolean = false;
      for(let x: number = 0; x < userLineBreaks.length; x++) {
        u = userLineBreaks[x];

        if (0 !== u.length) {
          let lineData = c(this.replaceSpecialCases(u));
          let l;
          

          for(let i: number = 0; i < lineData.lines.length; i++) {
            l = lineData.lines[i];


            if (0 === returnValue.length) {
              returnValue = l.replace(pipeCharExp, "|").replace(spaceExp, "&nbsp;");
            }
            else {
              if (prevHasDiv && x === userLineBreaks.length - 1 && i === lineData.lines.length - 1) {
                returnValue += l.replace(pipeCharExp, "|").replace(spaceExp, "&nbsp;");
              }
              else {
                returnValue += "<div>" + l.replace(pipeCharExp, "|").replace(spaceExp, "&nbsp;") + "</div>";  
              }         
            }

            prevHasDiv = l.indexOf("<div>") >= 0;
          }
        }
        else {
          returnValue += "<div><br></div>";
          prevHasDiv = true;
        }
      }

    return returnValue;
  }

  getSvgText(d: DrText): TextInfo[] {
    let returnValue: TextInfo[] = [];
    let c: any = d3Plus.textWrap()
      .fontFamily(d.fontFamily)
      .fontSize(d.size)
      .fontWeight(d.bold ? 'bold' : 'normal')
      .width(d.width - 2 * TEXT_PADDING);

      /*w = d3Plus.textWidth(l, 
        { 
          "font-size": d.size + "pt", 
          "font-family": d.fontFamily, 
          "font-weight": d.bold ? "bold" : "normal"
        });*/

      let userLineBreaks: string[] = d.text.split("\n");

      let multiplier: number = 1;
      let spaceExp: RegExp = new RegExp(SPACE_PLACEHOLDER + " ", "g");
      let pipeCharExp: RegExp = new RegExp(PIPE_CHAR_PLACEHOLDER, "g");

      let lineData;

      for(let u of userLineBreaks) {
        if (0 !== u.length) {
          lineData = c(this.replaceSpecialCases(u));
          for(let l of lineData.lines) {
            returnValue.push({
              text: l.replace(pipeCharExp, "|").replace(spaceExp, " "),
              lineHeightMultiplier: multiplier
            })
          }
          multiplier = 1;
        }
        else {
          if (0 === returnValue.length) {
            returnValue.push({
              text: "",
              lineHeightMultiplier: 1
            });
          }
          else {
            returnValue.push({
              text: "",
              lineHeightMultiplier: 0
            });
            multiplier++;
          }
        }
      }
    return returnValue;
  }

  getLineHeight(o: DrText): number {
    return Math.round(o.size * LINE_HEIGHT_RATIO);
  }
  
  getAscent(o: DrText): number {
    return (this.getLineHeight(o) - o.size);
  }

  private replaceSpecialCases(s: string): string {
    s = this.replaceSpaces(s);
    s = this.replacePipeChar(s);
    return s;
  }

  private replaceSpaces(s: string): string {
    let normalSplit: string[] = s.split(" ");
    let newSentence: string = "";

    for(let i: number = 0; i < normalSplit.length; i++) {
      if (i === normalSplit.length - 1) {
        newSentence += normalSplit[i].length > 0 ? (normalSplit[i]) : "";
      }
      else {
        newSentence += normalSplit[i].length > 0 ? (normalSplit[i] + " ") : SPACE_PLACEHOLDER + " ";
      }
    }
    return newSentence;
  }
  private replacePipeChar(s: string): string {
    let normalSplit: string[] = s.split("|");
    let newSentence: string = normalSplit.join(PIPE_CHAR_PLACEHOLDER);

    return newSentence;
  }
}
