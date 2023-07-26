import React from 'react'
import {
    $getSelection,
    $createTextNode,
} from "lexical";

function EmojiPicker(props) {

    async function insertEmoji(emoji) {
        await props.editor.update(async () => {
            const selection =  $getSelection();
    
            
    
            selection.insertNodes([$createTextNode(emoji)]);
    
            
          })
    }
  return (
    <ul className="dropdown-menu mt-2 p-0">
            <ul className="list-group list-group-horizontal">
              <li className="emoji-list dropdown-item list-group-item p-0 pt-1 border-0">
                {/* <button className='border-0'> */}
                    <span className="emoji-icon" onClick={()=>insertEmoji("😃")}>😃</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("😂")}>😂</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("😅")}>😅</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("🤔")}>🤔</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("😓")}>😓</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("😳")}>😳</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("😕")}>😕</span>
                {/* </button> */}
              </li>
            </ul>
            <ul className="list-group list-group-horizontal">
              <li className="emoji-list dropdown-item list-group-item p-0 pt-1 border-0">
                {/* <button className='border-0'> */}
                    <span className="emoji-icon" onClick={()=>insertEmoji("😀")}>😀</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("😂")}>😂</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("😅")}>😅</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("🤔")}>🤔</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("😓")}>😓</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("😳")}>😳</span>
                    <span className="emoji-icon" onClick={()=>insertEmoji("😕")}>😕</span>
                {/* </button> */}
              </li>
            </ul>
            
          </ul>
  )
}

export default EmojiPicker;