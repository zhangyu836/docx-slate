import {text, table} from "docxyz";
import {elementTypes} from "./types";
import {ParagraphTrans} from "./textTrans";

class CellTrans {
    static from(cell, options) {
        if (cell.merged) return null;
        let children = ContainerTrans.from(cell, options);
        return {
            type: elementTypes.CELL,
            colSpan: cell.col_span,
            rowSpan: 1, //cell.row_span, cost a lot of time, to be fixed
            children
        };
    }
    static to(element, cell, options) {
        cell.clear_content();
        ContainerTrans.to(element.children, cell, options);
    }
}

class RowTrans {
    static from(cells, options) {
        let children = [];
        for(let cell of cells){
            let cellElement = CellTrans.from(cell, options);
            if (cellElement)
                children.push(cellElement);
        }
        return {
            type: elementTypes.ROW,
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

class TableTrans {
    static from(table, options) {
        let children = [];
        //console.time('rows_with_cells');
        let rows = table.rows.rows_with_cells;
        //console.timeEnd('rows_with_cells');
        let colCount = 0;
        for(let row of rows){
            let rowElement = RowTrans.from(row.row_cells, options);
            children.push(rowElement);
            colCount = Math.max(colCount, row.row_cells.length);
        }
        return {
            type: elementTypes.TABLE,
            style: table.style.name,
            colCount,
            children
        };
    }
    static to(element, container, options) {
        let rowCount = element.children.length;
        let colCount = element.colCount;
        let table = container.add_table(rowCount, colCount);
        table.style = element.style;
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
