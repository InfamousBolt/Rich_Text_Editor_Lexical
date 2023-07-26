import ExampleTheme from "./themes/ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
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
import { MentionNode } from "./nodes/MentionNode.ts";
import { CustomParagraphNode } from "./nodes/CustomParagraphNode";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";

import ActionsPlugin from "./plugins/ActionsPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import prepopulatedText from "./SampleText.js";
import { PLAYGROUND_TRANSFORMERS } from "./plugins/MarkdownTransformers.ts";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import HtmlToMarkdown from "./utils/HtmlToMarkdown";
import { CustomLinkNode, LinkAttributes } from "./nodes/CustomLinkNode.tsx";
import { LexicalNode, ParagraphNode } from "lexical";
import React from "react";

export default function ReadOnlyEditor() {
  console.log(HtmlToMarkdown);
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "editor",
        editorState: () =>
          $convertFromMarkdownString(HtmlToMarkdown, PLAYGROUND_TRANSFORMERS),
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
          ImageNode,
          MentionNode,

          // CustomLinkNode,
          // {
          //     replace: LinkNode,
          //     with: (node) => {
          //         console.log("HELLLLLLOOOOOOOOOOOOO");
          //         return CustomLinkNode();
          //     }
          // },
          // CustomParagraphNode,
          LinkNode,
          {
            replace: LinkNode,
            with: (node: LinkNode) => {
              node.setTarget("_blank");
              console.log(node.getTarget());
              return new LinkNode(
                node.getURL(),
                { target: node.getTarget() },
                undefined
              );
            },
          },
        ],
        editable: false,
      }}
    >
      {/* <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner"> */}
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="editor-input"
            style={{ padding: "0px" }}
          />
        }
        placeholder={<></>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      {/* <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <CodeHighlightPlugin /> */}
      {/* </div>
        <ActionsPlugin />
      </div> */}
    </LexicalComposer>
  );
}
