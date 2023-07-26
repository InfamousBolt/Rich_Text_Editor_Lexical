import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_IMAGE_COMMAND } from "./ImagePlugin.ts";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import ListMaxIndentLevelPlugin from "./ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./CodeHighlightPlugin";
import AutoLinkPlugin from "./AutoLinkPlugin";
import ImagesPlugin from "./ImagePlugin.ts";
import EmojisPlugin from './EmojisPlugin.ts';
import EmojiPickerPlugin from './EmojiPickerPlugin.tsx';
// import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';



function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

function DragDrop() {
  
  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const [editor] = useLexicalComposerContext();
  const handlePaste = (e) => {
    if (e.clipboardData.files.length) {
      const files = e.clipboardData.files;
      Array.from(files).forEach(async file => {
        const base64 = await convertBase64(file);
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {altText: file.name,
        src: base64});
      });
      // console.log(fileObject);
      // const base64 = await convertBase64(fileObject);
      // editor.dispatchCommand(INSERT_IMAGE_COMMAND, {altText: fileObject.name,
      //   src: base64});
    }
  }
    const onDrop = useCallback(async acceptedFiles => {
        // Do something with the files
        console.log(acceptedFiles);
        const fileObject = acceptedFiles[0];
        console.log(fileObject);
        const base64 = await convertBase64(fileObject);
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {altText: fileObject.name,
          src: base64});
      }, [])
      const {getRootProps} = useDropzone({noClick: true, onDrop: onDrop})
    
      return (
        <div className="editor-inner" {...getRootProps()} onPaste={handlePaste}>
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input"/>}
            placeholder={<Placeholder />}
          />
          {/* <HashtagPlugin /> */}
          <EmojisPlugin />
          <EmojiPickerPlugin />
          
          <HistoryPlugin />
          <ImagesPlugin/>
          <AutoFocusPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

        </div>
        
        
      )
}

export default DragDrop