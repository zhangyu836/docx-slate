import {text, table} from "docxyz";
import {elementTypes} from "./types";
import {ParagraphTrans} from "./textTrans";
import {ST_Merge} from 'docxyz/src/oxml/simpletypes';
import {TblPrConv, TblGridConv, TrStyleConv, TcStyleConv, TblStyleConv} from "./style/tblStyleConv";

class CellTrans {
    static from(cell, options) {
        if (cell.merged) return null;
        let children = ContainerTrans.from(cell, options);
        let styleConv = new TcStyleConv(cell, null);
        return {
            type: elementTypes.CELL,
            colSpan: cell.colSpan,
            rowSpan: cell.rowSpan,
            styleConv,
            children
        };
    }
    static to(element, cell, options) {
        cell.clear_content();
        ContainerTrans.to(element.children, cell, options);
        let {styleConv} = element;
        styleConv.convToCell(cell);
    }
}

class RowTrans {
    static from(tr, options) {
        let children = [];
        for(let cell of tr.row_cells){
            let cellElement = CellTrans.from(cell, options);
            if (cellElement)
                children.push(cellElement);
        }
        let styleConv = new TrStyleConv(tr, null);
        return {
            type: elementTypes.ROW,
            styleConv,
            children
        };
    }
    static to(element, table, options) {
    }
}

class Range {
    constructor(rowx, colx, height, width) {
        this.rowx = rowx;
        this.colx = colx;
        this.height = height;
        this.width = width;
    }
    in(rx, cx) {
        return (this.rowx + this.height > rx) && (rx >= this.rowx) &&
            (this.colx + this.width > cx) && (cx >= this.colx);
    }
}
class Ranges {
    constructor() {
        this.ranges = [];
    }
    push(range) {
        this.ranges.push(range);
    }
    in(rx, cx) {
        for(let range of this.ranges) {
            if(range.in(rx, cx)) return true;
        }
        return false;
    }
}
class MergedCell{
    constructor(master, merged) {
        this.master = master;
        this.merged = merged;
    }
}
class Cell extends table._Cell{
    constructor(tc, parent) {
        super(tc, parent);
        this.rowSpan = 1;
        this.rows = [];
    }
    get colSpan() {
        return this._tc.grid_span
    }
    inc_row_span(rowx) {
        if(this.rows.includes(rowx))
            return;
        this.rows.push(rowx);
        this.rowSpan += 1;
    }
}
class Row extends table._Row{
}
function rows_with_cells(table) {
    let rows = [];
    let rowx = 0
    for (let tr of table._tbl.tr_lst) {
        let row_cells = [];
        let colx = 0;
        for (let tc of tr.tc_lst) {
            let {grid_span} = tc;
            for (let grid_span_idx = 0; grid_span_idx < grid_span; grid_span_idx += 1) {
                if (tc.vMerge === ST_Merge.CONTINUE) {
                    let master = rows[rowx - 1].row_cells[colx];
                    if (master.merged) {
                        master = master.master;
                    }
                    master.inc_row_span(rowx);
                    let merged = new MergedCell(master, 'v');
                    row_cells.push(merged);
                } else {
                    if (grid_span_idx > 0) {
                        let master = row_cells[colx - 1];
                        if (master.merged) {
                            master = master.master;
                        }
                        let merged = new MergedCell(master, 'h');
                        row_cells.push(merged);
                    } else {
                        let master = new Cell(tc, table);
                        row_cells.push(master);
                    }
                }
                colx += 1;
            }
        }
        rowx += 1;
        let row = new Row(tr, this);
        row.row_cells = row_cells;
        rows.push(row);
    }
    return rows;
}

class TableTrans {
    static from(table, options) {
        let children = [];
        //console.time('rows_with_cells');
        let rows = rows_with_cells(table);
        //console.timeEnd('rows_with_cells');
        let colCount = 0;
        for(let row of rows){
            let rowElement = RowTrans.from(row, options);
            children.push(rowElement);
            colCount = Math.max(colCount, row.row_cells.length);
        }
        let look = TblPrConv.getTblLook(table);
        //console.log('table look', look);
        let gridCols = TblGridConv.from(table);
        let colGroup = TblGridConv.toColGroup(gridCols);
        let styleConv = new TblStyleConv(table, null);
        return {
            type: elementTypes.TABLE,
            style: table.style.name,
            look,
            styleConv,
            colGroup,
            colCount,
            children
        };
    }
    static to(element, container, options) {
        let rowCount = element.children.length;
        let colCount = element.colCount;
        let table = container.add_table(rowCount, colCount);
        table.style = element.style;
        let {styleConv} = element;
        styleConv.convToTable(table);
        let cells = table._cells;
        let ranges = new Ranges();
        let rowx = 0;
        for(let rowElement of element.children) {
            let colx = 0;
            for(let cellElement of rowElement.children) {
                let cell = cells[rowx * colCount + colx];
                if(cellElement.rowSpan > 1 || cellElement.colSpan > 1) {
                    let range = new Range(rowx, colx,
                        cellElement.rowSpan, cellElement.colSpan);
                    ranges.push(range);
                    let other_idx = (rowx + cellElement.rowSpan - 1) * colCount
                        + colx + cellElement.colSpan - 1;
                    let other = cells[other_idx];
                    cell.merge(other);
                    CellTrans.to(cellElement, cell, options);
                } else if(!ranges.in(rowx, colx)) {
                    CellTrans.to(cellElement, cell, options);
                } else {
                }
                colx += 1;
            }
            rowx += 1;
        }
    }
}

class ContainerTrans {
    static from(container, options) {
        let children = [];
        for(let child of container.content) {
            if(child instanceof text.Paragraph) {
                let paragraph = ParagraphTrans.from(child, options);
                children.push(paragraph);
            } else if(child instanceof table.Table) {
                let table = TableTrans.from(child, options);
                children.push(table);
            }
        }
        return children;
    }
    static to(data, container, options) {
        for(let element of data) {
            if(element.type===elementTypes.TABLE){
                TableTrans.to(element, container, options);
            }
            else if(element.type===elementTypes.PARAGRAPH) {
                ParagraphTrans.to(element, container, options);
            }
        }
    }
}

export {TableTrans, ContainerTrans};
