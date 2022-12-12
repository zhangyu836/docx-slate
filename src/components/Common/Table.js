import React from 'react';
import {Editor, Range, Point, Element as SlateElement} from 'slate';
import {useSlate} from "slate-react";
import { cx, css } from '@emotion/css';

const withTables = editor => {
    const { deleteBackward, deleteForward, deleteFragment } = editor;
    editor.deleteBackward = unit => {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
            const [cell] = Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n.type === 'cell',
            });
            if (cell) {
                const [, cellPath] = cell;
                const start = Editor.start(editor, cellPath);
                if (Point.equals(selection.anchor, start)) {
                    return
                }
            }
        }
        deleteBackward(unit);
    }
    editor.deleteForward = unit => {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
            const [cell] = Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n.type === 'cell',
            })
            if (cell) {
                const [, cellPath] = cell;
                const end = Editor.end(editor, cellPath);
                if (Point.equals(selection.anchor, end)) {
                    return
                }
            }
        }
        deleteForward(unit);
    }
    editor.deleteFragment = () => {
        const { selection } = editor;
        if (selection ) {
            const [cell0, cell1] = Editor.nodes(editor, {
                match: n =>
                    !Editor.isEditor(n) &&
                    SlateElement.isElement(n) &&
                    n.type === 'cell',
            })
            if (cell0 && cell1) {
                return;
            } else if (cell0) {
                const [, cellPath] = cell0;
                const [cellStart, cellEnd] = Editor.edges(editor, cellPath);
                //const cellStart = Editor.start(editor, cellPath);
                let selectionStart, selectionEnd;
                if( Point.isBefore(selection.anchor, selection.focus) ) {
                    selectionStart = selection.anchor;
                    selectionEnd = selection.focus;
                } else {
                    selectionEnd = selection.anchor;
                    selectionStart = selection.focus;
                }
                if( Point.isAfter(selectionEnd, cellEnd) ||
                    Point.isBefore(selectionStart, cellStart) ) {
                    return;
                }
            }
        }
        deleteFragment();
    }
    return editor;
}

const Table = ({ attributes, children, element }) => {
    if (element) {
        let editor = useSlate();
        let cssClass = editor.getTableFormatStyle(element);
        let {styleObj} = element.styleConv;
        return (
            <table className={cssClass} style={styleObj} {...attributes}>
                {element.colGroup}
                <tbody>
                {children}
                </tbody>
            </table>
        );
    }
};
const Row = ({ attributes, children, element }) => {
    if (element) {
        let {styleObj} = element.styleConv;
        return (
            <tr style={styleObj} {...attributes}>
                {children}
            </tr>
        );
    }
};
const Cell = ({ attributes, children, element }) => {
    if (element) {
        let spans = {
            colSpan: element.colSpan,
            rowSpan: element.rowSpan,
        }
        let {styleObj} = element.styleConv;
        //console.log('display cell style conv', styleConv, styleObj);
        return (
            <td {...spans} style={styleObj} {...attributes}>
                {children}
            </td>
        );
    }
};

export {withTables, Table, Row, Cell};
