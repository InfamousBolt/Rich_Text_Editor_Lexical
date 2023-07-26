import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getRoot } from "lexical";
import * as React from "react";
import { useCallback } from "react";

import { PLAYGROUND_TRANSFORMERS } from "./MarkdownTransformers.ts";

export default function ActionsPlugin(props): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === "markdown") {
        console.log(firstChild.getTextContent());
        props.setMarkdownText(firstChild.getTextContent());
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          PLAYGROUND_TRANSFORMERS
        );
      } else {
        const markdown = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS);
        root
          .clear()
          .append(
            $createCodeNode("markdown").append($createTextNode(markdown))
          );
      }
      root.selectEnd();
    });
  }, [editor]);

  return (
    <div className="actions">
      <button
        className="toolbar-item"
        onClick={handleMarkdownToggle}
        aria-label="Convert from markdown"
      >
        <i className="format markdown" />
      </button>
    </div>
  );
}
