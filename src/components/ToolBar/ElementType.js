import { useSlate } from 'slate-react';
import {toggleBlock} from './BlockButton';
import {Editor, Element as SlateElement} from "slate";

export const Dropdown = () => {
    const editor = useSlate();
    let {options, types} = editor.elementTypes;
    return (
        <select style={{ width: 170, height:33 }}
            value={activeBlockType(editor, types)}
            onChange={(e) => changeFormat(editor, e)}
        >
            {options.map((item, index) => (
                <option key={index} value={item.value}>
                    {item.text}
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
                SlateElement.isElement(n) && types.includes(n.type),
        }
    );
    if(match) return match[0].type;
    return '';
};
const changeFormat = (editor, event) => {
    event.preventDefault();
    const value = event.target.value;
    toggleBlock(editor, value);
};
