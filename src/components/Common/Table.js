import React from 'react';
import {Editor, Range, Point, Element as SlateElement} from 'slate';

const withTables = editor => {
    const { deleteBackward, deleteForward } = editor;
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
    return editor;
}

const Table = ({ attributes, children, element }) => {
    if (element) {
        switch (element.type) {
            case 'table' :
                return (<table><tbody  {...attributes}>
                        {children}
                    </tbody></table>
                );
            case 'row' :
                return (
                    <tr {...attributes}>
                        {children}
                    </tr>
                );
            case 'cell' :
                let styleObj = {
                    colSpan: element.colSpan,
                }
                if(element.rowSpan) styleObj.rowSpan = element.rowSpan;
                if(element.merged) styleObj.display = 'none';
                return (
                    <td {...styleObj} style={styleObj} {...attributes}>
                        {children}
                    </td>
                );
        }
    }
};

export {withTables, Table};
