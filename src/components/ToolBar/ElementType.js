import { useSlate } from 'slate-react';
import {toggleBlock} from './BlockButton';
import {Editor, Element as SlateElement} from "slate";

export const Dropdown = () => {
    const editor = useSlate();
    let types = editor.getElementTypes();
    return (
        <select style={{ width: 170, height:33 }}
            value={activeBlockType(editor, types)}
            onChange={(e) => changeFormat(editor, e)}
        >
            {types.map((item, index) => (
                <option key={index} value={item}>
                    {item}
                </option>
            ))}
        </select>
    );
};
const activeBlockType = (editor, types) => {
    const { selection } = editor;
    if (!selection) return '';
    const [match] =
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type==='paragraph' &&
                types.includes(n.style),
        }
    );
    if(match) return match[0].style;
    return '';
};
const changeFormat = (editor, event) => {
    event.preventDefault();
    const value = event.target.value;
    toggleBlock(editor, value);
};
