
import {register_element_cls} from 'docxyz/src/oxml/xmlelemlookup';
import {CT_Border, CT_Borders} from 'docxyz/src/oxml/text/parfmt';
import {CT_TblWidth} from 'docxyz/src/oxml/table';
import {BaseOxmlElement, RequiredAttribute,
    ZeroOrOne, OptionalAttribute} from 'docxyz/src/oxml/xmlchemy';
import {ST_HexColor, ST_String, XsdInt,
    ST_OnOff, ST_TwipsMeasure } from 'docxyz/src/oxml/simpletypes';
import {CT_R} from 'docxyz/src/oxml/text/run';

class CT_TblStylePr extends BaseOxmlElement {
    pPr = new ZeroOrOne('w:pPr');
    rPr = new ZeroOrOne('w:rPr');
    tblPr = new ZeroOrOne('w:tblPr');
    trPr = new ZeroOrOne('w:trPr');
    tcPr = new ZeroOrOne('w:tcPr');
    type = new RequiredAttribute('w:type', ST_String);
}
class CT_TblStyleRowBandSize extends BaseOxmlElement {
    val = new RequiredAttribute('w:val', XsdInt);
}
class CT_TblStyleColBandSize extends BaseOxmlElement {
    val = new RequiredAttribute('w:val', XsdInt);
}
class CT_TblLook extends BaseOxmlElement {
    val = new OptionalAttribute('w:val', ST_String);//hex
    firstRow = new OptionalAttribute('w:firstRow', ST_OnOff);
    lastRow = new OptionalAttribute('w:lastRow', ST_OnOff);
    firstColumn = new OptionalAttribute('w:firstColumn', ST_OnOff);
    lastColumn = new OptionalAttribute('w:lastColumn', ST_OnOff);
    noHBand = new OptionalAttribute('w:noHBand', ST_OnOff);
    noVBand = new OptionalAttribute('w:noVBand', ST_OnOff);
}
class CT_Shading extends BaseOxmlElement {
    val = new RequiredAttribute('w:val', ST_String);
    color = new RequiredAttribute('w:color', ST_HexColor);
    fill = new RequiredAttribute('w:fill', ST_HexColor);
}
class CT_CellMarSide extends CT_Border {
    w = new OptionalAttribute('w:w', ST_TwipsMeasure);
    type = new OptionalAttribute('w:type', ST_String);
    sz = new OptionalAttribute('w:sz', ST_TwipsMeasure);
    space = new OptionalAttribute("w:space", XsdInt);
}
class CT_TblCellMar extends CT_Borders {
}

class CT_TblInd extends BaseOxmlElement {
    w = new OptionalAttribute('w:w', ST_TwipsMeasure);
    type = new OptionalAttribute('w:type', ST_String);
}

class CT_R2 extends CT_R {
    get text() {
        let text = [];
        for (let child of this.slice()) {
            switch (child.tagName) {
                case "w:t":
                    let t_text = child.text;
                    if(t_text)
                        text.push(t_text);
                    break;
                case "w:tab":
                    text.push("\t");
                    break;
                case "w:br":
                case "w:cr":
                    text.push("\n");
                    break;
            }
        }
        return text.join();
    }
    set text(text) {
        super.text = text;
    }
}



register_element_cls('w:tblBorders', CT_Borders);
register_element_cls('w:tcBorders', CT_Borders);
register_element_cls('w:shd', CT_Shading);
register_element_cls("w:r", CT_R2);
register_element_cls("w:tblStylePr", CT_TblStylePr);
register_element_cls("w:tblStyleRowBandSize", CT_TblStyleRowBandSize);
register_element_cls("w:tblStyleColBandSize", CT_TblStyleColBandSize);
register_element_cls("w:tblLook", CT_TblLook);
register_element_cls('w:top', CT_CellMarSide);
register_element_cls('w:bottom', CT_CellMarSide);
register_element_cls('w:left', CT_CellMarSide);
register_element_cls('w:right', CT_CellMarSide);
register_element_cls('w:bdr', CT_CellMarSide);
register_element_cls("w:tblCellMar", CT_TblCellMar);
register_element_cls("w:tblW", CT_TblWidth);
register_element_cls("w:tblInd", CT_TblInd);
export {}
