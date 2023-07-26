import ExampleTheme from "./themes/ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import ImagesPlugin from "./plugins/ImagePlugin.ts";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { ImageNode } from "./nodes/ImageNode.tsx";
import MentionsPlugin from "./plugins/MentionsPlugin.tsx";
import ActionsPlugin from "./plugins/ActionsPlugin.tsx";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import prepopulatedText from "./SampleText.js";
import { MentionNode } from "./nodes/MentionNode.ts";
import { EmojiNode } from "./nodes/EmojiNode.tsx";
import DragDrop from "./plugins/DragDrop";
import { useState } from "react";


const editorConfig = {
  editorState: prepopulatedText,
  theme: ExampleTheme,
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    ImageNode,
    MentionNode,
    EmojiNode,
  ]
};

export default function Editor(props) {
  const [markdown, setMarkdown] = useState("");
  const setMarkdownText = (text) => {
    setMarkdown(text);
  }
  props.setContentText(markdown);
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        {/* <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<Placeholder />}
          />
          <AutoFocusPlugin />
          <ListPlugin />
          <ImagesPlugin/>
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <CodeHighlightPlugin />
        </div> */}
        <MentionsPlugin />
        <DragDrop />
        <ToolbarPlugin showAs={props.showAs} />

      </div>
      {/* <ActionsPlugin /> */}

      <ActionsPlugin setMarkdownText={setMarkdownText} />
    </LexicalComposer>

  );
}
