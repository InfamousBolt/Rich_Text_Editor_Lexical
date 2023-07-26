import type {
  ElementTransformer,
  Transformer,
  TextMatchTransformer,
} from "@lexical/markdown";
import {
  $createParagraphNode,
  $isParagraphNode,
  LexicalNode,
  ParagraphNode,
  ElementNode,
  TextFormatType,
} from "lexical";

import { $createHeadingNode, HeadingTagType } from "@lexical/rich-text";

import {
  ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
} from "@lexical/markdown";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import {
  $createImageNode,
  $isImageNode,
  ImageNode,
} from "../nodes/ImageNode.tsx";
import {
  $createMentionNode,
  $isMentionNode,
  MentionNode,
} from "../nodes/MentionNode.ts";
import { $createTextNode, $isTextNode, TextNode } from "lexical";
import GetUsername from "../utils/GetUsername.js";

export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    return $isHorizontalRuleNode(node) ? "***" : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    console.log(parentNode);
    const line = $createHorizontalRuleNode();

    // TODO: Get rid of isImport flag
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: "element",
};

export const IMAGE: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node, exportChildren, exportFormat) => {
    if (!$isImageNode(node)) {
      return null;
    }
    console.log(node);

    return `![${node.getAltText()}](${node.getSrc()})`;
  },
  importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    console.log(textNode);
    console.log(match);
    const [, altText, src] = match;
    const imageNode = $createImageNode({
      altText,
      maxWidth: 420,
      src,
    });
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match",
};
export const MENTION: TextMatchTransformer = {
  dependencies: [MentionNode],
  export: (node, exportChildren, exportFormat) => {
    if (!$isMentionNode(node)) {
      return null;
    }
    console.log(node);

    return `#[${node.__type}](${node.__user.id})`;
  },
  importRegExp: /#(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  regExp: /#(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    const [, type, id] = match;
    const userInfo = GetUsername(id);
    let mentionNode: MentionNode;
    if (userInfo.deleted) {
      mentionNode = $createMentionNode(
        userInfo.deleted,
        { name: "(Deleted User)", id: id },
        "(Deleted User)"
      );
    } else {
      mentionNode = $createMentionNode(
        userInfo.deleted,
        { name: userInfo.name, id: id },
        userInfo.name
      );
    }
    textNode.replace(mentionNode);
  },
  trigger: ")",
  type: "text-match",
};

const createParaNode = (
  createNode: (match: Array<string>) => ElementNode
): ElementTransformer["replace"] => {
  return (parentNode, children, match) => {
    const node = createNode(match);
    node.append(...children);
    parentNode.replace(node);
    node.select(0, 0);
  };
};

export const ALIGNMENT: ElementTransformer = {
  dependencies: [ParagraphNode],
  export: (node: LexicalNode, exportChildren) => {
    if (!$isParagraphNode(node) || node.__format == 1 || node.__format == 0)
      return null;
    else {
      if (node.__format == 2) return `-_[center] ` + exportChildren(node);
      else if (node.__format == 3) return `-_[right] ` + exportChildren(node);
      else if (node.__format == 4) return `-_[justify] ` + exportChildren(node);
      else return null;
    }
  },
  regExp: /-_\[right\]|-_\[center\]|-_\[justify\]\s/,

  replace: createParaNode((match) => {
    console.log(match[0]);
    // const tag = ("h" + match[1].length) as HeadingTagType;
    const formatedPara = $createParagraphNode();
    // formatedPara.__format = 2;
    if (match[0] == "-_[right]") formatedPara.__format = 3;
    else if (match[0] == "-_[center]") formatedPara.__format = 2;
    else if (match[0] == "-_[justify]") formatedPara.__format = 4;

    return formatedPara;
  }),
  type: "element",
};

// export const UNDERLINE: TextMatchTransformer = {
//   dependencies: [TextNode],
//   export: (node, exportChildren, exportFormat) => {
//     if (!$isTextNode(node)) {
//       return null;
//     } else {
//       if (node.getFormat() == 8) return `|_[underline](${node.__text})`;
//       // else if (node.__format == 9) return `|_[underline](**${node.__text}**)`;
//       // else if (node.__format == 10) return `|_[italic_under](${node.__text})`;
//       // else if (node.__format == 11) return `|_[all_under](${node.__text})`;
//     }
//     return null;
//   },
//   importRegExp: /\|_(?:\[([^[]*)\])(?:\(([^(]+)\))/,
//   regExp: /\|_(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
//   replace: (textNode, match) => {
//     // console.log(textNode);
//     // console.log(match);
//     const [, type, name] = match;
//     console.log(type);
//     const newTextNode = $createTextNode(name);
//     if (type == "underline") newTextNode.toggleFormat("underline");
//     // else if (type == "bold_under") newTextNode.__format = 9;
//     // else if (type == "italic_under") newTextNode.__format = 10;
//     // else if (type == "all_under") newTextNode.__format = 11;
//     textNode.replace(newTextNode);
//   },
//   trigger: ")",
//   type: "text-match",
// };

// export const FIX_1: TextMatchTransformer = {
//   dependencies: [TextNode],
//   export: (node, exportChildren, exportFormat) => null,
//   importRegExp: /\*[A-Za-z0-9\s\*]+\*\*[A-Za-z0-9\s\*]+\*\*\*/,
//   regExp: /\*[A-Za-z0-9\s\*]+\*\*[A-Za-z0-9\s\*]+\*\*\*/,
//   replace: (textNode, match) => {
//     console.log(textNode);
//     const captured = match[0].split("**");
//     const bold_italic_node = $createTextNode(captured[1])
//       .toggleFormat("bold")
//       .toggleFormat("italic");
//     const italic_node = $createTextNode(captured[0].split("*")[1]).toggleFormat(
//       "italic"
//     );
//     // console.log(bold_italic_node);
//     // console.log(italic_node);
//     const para = $createParagraphNode();
//     para.append(italic_node, bold_italic_node);
//     textNode.replace(para);
//   },
//   trigger: ")",
//   type: "text-match",
// };

export type TextFormatTransformer = Readonly<{
  format: ReadonlyArray<TextFormatType>;
  tag: string;
  intraword?: boolean;
  type: "text-format";
}>;

export const UNDERLINE: TextFormatTransformer = {
  format: ["underline"],
  tag: "^:",
  type: "text-format",
};

export const BOLD: TextFormatTransformer = {
  format: ["bold"],
  tag: "-_",
  type: "text-format",
};

export const PLAYGROUND_TRANSFORMERS: Array<Transformer> = [
  HR,
  IMAGE,
  MENTION,
  UNDERLINE,
  BOLD,
  ALIGNMENT,
  ...ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];
