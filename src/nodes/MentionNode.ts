import { Spread } from "lexical";

import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  TextNode,
} from "lexical";

export type SerializedMentionNode = Spread<
  {
    deleted: boolean;
    user: { id: string; name: string };
    mentionName: string;
    type: "mention";
    version: 1;
  },
  SerializedTextNode
>;

const convertMentionElement = (
  domNode: HTMLElement
): DOMConversionOutput | null => {
  console.log("convertinggggg");
  console.log("DOMMM", domNode);
  const textContent = domNode.textContent;

  if (textContent !== null) {
    const node = $createMentionNode(
      false,
      { name: textContent, id: "1234" },
      textContent
    );
    node.isToken();
    return {
      node,
    };
  }

  return null;
};

const mentionStyle = "background-color: rgba(24, 119, 232, 0.2)";
export class MentionNode extends TextNode {
  __deleted: boolean;
  __user: { id: string; name: string };
  __mention: string;

  static getType(): string {
    return "mention";
  }

  isInline() {
    return true;
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(
      node.__deleted,
      node.__user,
      node.__mention,
      node.__text,
      node.__key
    );
  }
  static importJSON(serializedNode: SerializedMentionNode): MentionNode {
    const node = $createMentionNode(
      serializedNode.deleted,
      serializedNode.user,
      serializedNode.mentionName
    );
    node.isToken();
    node.setTextContent(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);

    node.setStyle(serializedNode.style);
    return node;
  }

  constructor(
    deleted: boolean,
    user: { name: string; id: string },
    mentionName: string,
    text?: string,
    key?: NodeKey
  ) {
    super(text ?? mentionName, key);
    this.__deleted = deleted;
    this.__user = user;
    this.__mention = mentionName;
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      deleted: this.__deleted,
      user: this.__user,
      mentionName: this.__mention,
      type: "mention",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const domOuter = document.createElement("span");
    domOuter.contentEditable = "true";

    const domChild = super.createDOM(config);
    domChild.style.cssText = mentionStyle;
    domChild.className = "mention";
    domChild.contentEditable = "false";

    const spacer = document.createElement("span");
    spacer.setAttribute("data-lexical-text", "true");

    domOuter.appendChild(domChild);
    domOuter.appendChild(spacer);

    return domOuter;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.className = "user-tag";
    const elementOne = document.createElement("span");
    elementOne.setAttribute("contentEditable", "false");
    element.appendChild(elementOne);
    elementOne.textContent = this.__text;
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (domNode: HTMLElement) => {
        if (!domNode.classList.contains("user-tag")) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 1,
        };
      },
    };
  }

  isTextEntity(): true {
    return true;
  }

  isToken(): true {
    return true;
  }
}

export const $createMentionNode = (
  deleted: boolean,
  user: { name: string; id: string },
  mentionName: string
): MentionNode => {
  const mentionNode = new MentionNode(deleted, user, mentionName);

  mentionNode.setMode("segmented").toggleDirectionless();
  return mentionNode;
};

export const $isMentionNode = (
  node: LexicalNode | null | undefined
): node is MentionNode => {
  return node instanceof MentionNode;
};
