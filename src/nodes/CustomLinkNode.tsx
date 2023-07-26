/** @module @lexical/link */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  GridSelection,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  NodeSelection,
  RangeSelection,
  SerializedElementNode,
} from "lexical";

import { addClassNamesToElement, isHTMLAnchorElement } from "@lexical/utils";
import {
  $applyNodeReplacement,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  createCommand,
  ElementNode,
  Spread,
} from "lexical";

export type LinkAttributes = {
  rel?: null | string;
  target?: null | string;
  title?: null | string;
};

export type SerializedCustomLinkNode = Spread<
  {
    url: string;
  },
  Spread<LinkAttributes, SerializedElementNode>
>;

const SUPPORTED_URL_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "sms:",
  "tel:",
]);

/** @noInheritDoc */
export class CustomLinkNode extends ElementNode {
  /** @internal */
  __url: string;
  /** @internal */
  __target: null | string;
  /** @internal */
  __rel: null | string;
  /** @internal */
  __title: null | string;

  static getType(): string {
    return "link";
  }

  static clone(node: CustomLinkNode): CustomLinkNode {
    return new CustomLinkNode(
      node.__url,
      { rel: node.__rel, target: node.__target, title: node.__title },
      node.__key
    );
  }

  constructor(url: string, attributes: LinkAttributes = {}, key?: NodeKey) {
    super(key);
    const { target = null, rel = null, title = null } = attributes;
    this.__url = url;
    this.__target = target;
    this.__rel = rel;
    this.__title = title;
  }

  createDOM(config: EditorConfig): HTMLAnchorElement {
    const element = document.createElement("a");
    element.href = this.sanitizeUrl(this.__url);
    if (this.__target !== null) {
      element.target = this.__target;
    }
    if (this.__rel !== null) {
      element.rel = this.__rel;
    }
    if (this.__title !== null) {
      element.title = this.__title;
    }
    addClassNamesToElement(element, config.theme.link);
    return element;
  }

  updateDOM(
    prevNode: CustomLinkNode,
    anchor: HTMLAnchorElement,
    config: EditorConfig
  ): boolean {
    const url = this.__url;
    const target = this.__target;
    const rel = this.__rel;
    const title = this.__title;
    if (url !== prevNode.__url) {
      anchor.href = url;
    }

    if (target !== prevNode.__target) {
      if (target) {
        anchor.target = target;
      } else {
        anchor.removeAttribute("target");
      }
    }

    if (rel !== prevNode.__rel) {
      if (rel) {
        anchor.rel = rel;
      } else {
        anchor.removeAttribute("rel");
      }
    }

    if (title !== prevNode.__title) {
      if (title) {
        anchor.title = title;
      } else {
        anchor.removeAttribute("title");
      }
    }
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (node: Node) => ({
        conversion: convertAnchorElement,
        priority: 1,
      }),
    };
  }

  static importJSON(
    serializedNode: SerializedCustomLinkNode | SerializedAutoCustomLinkNode
  ): CustomLinkNode {
    const node = $createCustomLinkNode(serializedNode.url, {
      rel: serializedNode.rel,
      target: serializedNode.target,
      title: serializedNode.title,
    });
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  sanitizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      // eslint-disable-next-line no-script-url
      if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
        return "about:blank";
      }
    } catch {
      return url;
    }
    return url;
  }

  exportJSON(): SerializedCustomLinkNode | SerializedAutoCustomLinkNode {
    return {
      ...super.exportJSON(),
      rel: this.getRel(),
      target: this.getTarget(),
      title: this.getTitle(),
      type: "link",
      url: this.getURL(),
      version: 1,
    };
  }

  getURL(): string {
    return this.getLatest().__url;
  }

  setURL(url: string): void {
    const writable = this.getWritable();
    writable.__url = url;
  }

  getTarget(): null | string {
    return this.getLatest().__target;
  }

  setTarget(target: null | string): void {
    const writable = this.getWritable();
    writable.__target = target;
  }

  getRel(): null | string {
    return this.getLatest().__rel;
  }

  setRel(rel: null | string): void {
    const writable = this.getWritable();
    writable.__rel = rel;
  }

  getTitle(): null | string {
    return this.getLatest().__title;
  }

  setTitle(title: null | string): void {
    const writable = this.getWritable();
    writable.__title = title;
  }

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true
  ): null | ElementNode {
    const element = this.getParentOrThrow().insertNewAfter(
      selection,
      restoreSelection
    );
    if ($isElementNode(element)) {
      const CustomlinkNode = $createCustomLinkNode(this.__url, {
        rel: this.__rel,
        target: this.__target,
        title: this.__title,
      });
      element.append(CustomlinkNode);
      return CustomlinkNode;
    }
    return null;
  }

  canInsertTextBefore(): false {
    return false;
  }

  canInsertTextAfter(): false {
    return false;
  }

  canBeEmpty(): false {
    return false;
  }

  isInline(): true {
    return true;
  }

  extractWithChild(
    child: LexicalNode,
    selection: RangeSelection | NodeSelection | GridSelection,
    destination: "clone" | "html"
  ): boolean {
    if (!$isRangeSelection(selection)) {
      return false;
    }

    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();

    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      selection.getTextContent().length > 0
    );
  }
}

function convertAnchorElement(domNode: Node): DOMConversionOutput {
  let node: CustomLinkNode | null = null;
  if (isHTMLAnchorElement(domNode)) {
    const content = domNode.textContent;
    if (content !== null && content !== "") {
      node = $createCustomLinkNode(domNode.getAttribute("href") || "", {
        rel: domNode.getAttribute("rel"),
        target: domNode.getAttribute("target"),
        title: domNode.getAttribute("title"),
      });
    }
  }
  return { node };
}

/**
 * Takes a URL and creates a CustomLinkNode.
 * @param url - The URL the CustomLinkNode should direct to.
 * @param attributes - Optional HTML a tag attributes { target, rel, title }
 * @returns The CustomLinkNode.
 */
export function $createCustomLinkNode(
  url: string,
  attributes?: LinkAttributes
): CustomLinkNode {
  return $applyNodeReplacement(new CustomLinkNode(url, attributes));
}

/**
 * Determines if node is a CustomLinkNode.
 * @param node - The node to be checked.
 * @returns true if node is a CustomLinkNode, false otherwise.
 */
export function $isCustomLinkNode(
  node: LexicalNode | null | undefined
): node is CustomLinkNode {
  return node instanceof CustomLinkNode;
}

export type SerializedAutoCustomLinkNode = SerializedCustomLinkNode;

// Custom node type to override `canInsertTextAfter` that will
// allow typing within the link
export class AutoCustomLinkNode extends CustomLinkNode {
  static getType(): string {
    return "autolink";
  }

  static clone(node: AutoCustomLinkNode): AutoCustomLinkNode {
    return new AutoCustomLinkNode(
      node.__url,
      { rel: node.__rel, target: node.__target, title: node.__title },
      node.__key
    );
  }

  static importJSON(
    serializedNode: SerializedAutoCustomLinkNode
  ): AutoCustomLinkNode {
    const node = $createAutoCustomLinkNode(serializedNode.url, {
      rel: serializedNode.rel,
      target: serializedNode.target,
      title: serializedNode.title,
    });
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  static importDOM(): null {
    // TODO: Should link node should handle the import over autolink?
    return null;
  }

  exportJSON(): SerializedAutoCustomLinkNode {
    return {
      ...super.exportJSON(),
      type: "autolink",
      version: 1,
    };
  }

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true
  ): null | ElementNode {
    const element = this.getParentOrThrow().insertNewAfter(
      selection,
      restoreSelection
    );
    if ($isElementNode(element)) {
      const CustomlinkNode = $createAutoCustomLinkNode(this.__url, {
        rel: this._rel,
        target: this.__target,
        title: this.__title,
      });
      element.append(CustomlinkNode);
      return CustomlinkNode;
    }
    return null;
  }
}

/**
 * Takes a URL and creates an AutoCustomLinkNode. AutoCustomLinkNodes are generally automatically generated
 * during typing, which is especially useful when a button to generate a CustomLinkNode is not practical.
 * @param url - The URL the CustomLinkNode should direct to.
 * @param attributes - Optional HTML a tag attributes. { target, rel, title }
 * @returns The CustomLinkNode.
 */
export function $createAutoCustomLinkNode(
  url: string,
  attributes?: LinkAttributes
): AutoCustomLinkNode {
  return $applyNodeReplacement(new AutoCustomLinkNode(url, attributes));
}

/**
 * Determines if node is an AutoCustomLinkNode.
 * @param node - The node to be checked.
 * @returns true if node is an AutoCustomLinkNode, false otherwise.
 */
export function $isAutoCustomLinkNode(
  node: LexicalNode | null | undefined
): node is AutoCustomLinkNode {
  return node instanceof AutoCustomLinkNode;
}

export const TOGGLE_LINK_COMMAND: LexicalCommand<
  string | ({ url: string } & LinkAttributes) | null
> = createCommand("TOGGLE_LINK_COMMAND");

/**
 * Generates or updates a CustomLinkNode. It can also delete a CustomLinkNode if the URL is null,
 * but saves any children and brings them up to the parent node.
 * @param url - The URL the link directs to.
 * @param attributes - Optional HTML a tag attributes. { target, rel, title }
 */
export function toggleLink(
  url: null | string,
  attributes: LinkAttributes = {}
): void {
  const { target, title } = attributes;
  const rel = attributes.rel === undefined ? "noopener" : attributes.rel;
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return;
  }
  const nodes = selection.extract();

  if (url === null) {
    // Remove CustomLinkNodes
    nodes.forEach((node) => {
      const parent = node.getParent();

      if ($isCustomLinkNode(parent)) {
        const children = parent.getChildren();

        for (let i = 0; i < children.length; i++) {
          parent.insertBefore(children[i]);
        }

        parent.remove();
      }
    });
  } else {
    // Add or merge CustomLinkNodes
    if (nodes.length === 1) {
      const firstNode = nodes[0];
      // if the first node is a CustomLinkNode or if its
      // parent is a CustomLinkNode, we update the URL, target and rel.
      const CustomlinkNode = $isCustomLinkNode(firstNode)
        ? firstNode
        : $getLinkAncestor(firstNode);
      if (CustomlinkNode !== null) {
        CustomlinkNode.setURL(url);
        if (target !== undefined) {
          CustomlinkNode.setTarget(target);
        }
        if (rel !== null) {
          CustomlinkNode.setRel(rel);
        }
        if (title !== undefined) {
          CustomlinkNode.setTitle(title);
        }
        return;
      }
    }

    let prevParent: ElementNode | CustomLinkNode | null = null;
    let CustomlinkNode: CustomLinkNode | null = null;

    nodes.forEach((node) => {
      const parent = node.getParent();

      if (
        parent === CustomlinkNode ||
        parent === null ||
        ($isElementNode(node) && !node.isInline())
      ) {
        return;
      }

      if ($isCustomLinkNode(parent)) {
        CustomlinkNode = parent;
        parent.setURL(url);
        if (target !== undefined) {
          parent.setTarget(target);
        }
        if (rel !== null) {
          CustomlinkNode.setRel(rel);
        }
        if (title !== undefined) {
          CustomlinkNode.setTitle(title);
        }
        return;
      }

      if (!parent.is(prevParent)) {
        prevParent = parent;
        CustomlinkNode = $createCustomLinkNode(url, { rel, target });

        if ($isCustomLinkNode(parent)) {
          if (node.getPreviousSibling() === null) {
            parent.insertBefore(CustomlinkNode);
          } else {
            parent.insertAfter(CustomlinkNode);
          }
        } else {
          node.insertBefore(CustomlinkNode);
        }
      }

      if ($isCustomLinkNode(node)) {
        if (node.is(CustomlinkNode)) {
          return;
        }
        if (CustomlinkNode !== null) {
          const children = node.getChildren();

          for (let i = 0; i < children.length; i++) {
            CustomlinkNode.append(children[i]);
          }
        }

        node.remove();
        return;
      }

      if (CustomlinkNode !== null) {
        CustomlinkNode.append(node);
      }
    });
  }
}

function $getLinkAncestor(node: LexicalNode): null | LexicalNode {
  return $getAncestor(node, $isCustomLinkNode);
}

function $getAncestor<NodeType extends LexicalNode = LexicalNode>(
  node: LexicalNode,
  predicate: (ancestor: LexicalNode) => ancestor is NodeType
): null | LexicalNode {
  let parent: null | LexicalNode = node;
  while (
    parent !== null &&
    (parent = parent.getParent()) !== null &&
    !predicate(parent)
  );
  return parent;
}
