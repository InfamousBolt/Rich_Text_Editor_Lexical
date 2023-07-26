import React from 'react'
import { PLAYGROUND_TRANSFORMERS } from "./plugins/MarkdownTransformers.ts";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ImageNode } from "./nodes/ImageNode.tsx";
import { MentionNode } from "./nodes/MentionNode.ts";
import { EmojiNode } from "./nodes/EmojiNode.tsx";
import {
    $convertFromMarkdownString,
    $convertToMarkdownString
} from "@lexical/markdown";
import ExampleTheme from "./themes/ExampleTheme";


function ReadEditor(props) {
    return (
        <LexicalComposer
            initialConfig={{
                theme: ExampleTheme,
                editorState: () => $convertFromMarkdownString(".:Hello-_Thee.:-_", PLAYGROUND_TRANSFORMERS),
                namespace: 'editor',
                onError(error) {
                    throw error;
                },
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
                ],
                editable: false,
            }}
        >
            <RichTextPlugin contentEditable={<ContentEditable />} placeholder={null} />
            <div></div>
        </LexicalComposer>
    )
}

export default ReadEditor