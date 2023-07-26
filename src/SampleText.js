import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { $createHeadingNode} from "@lexical/rich-text";
export default function prepopulatedText() {
  const root = $getRoot();

  const heading = $createHeadingNode("h1");
  heading.append($createTextNode("LEXICAL RTE"));
  root.append(heading);
  const paragraph = $createParagraphNode();
  paragraph.append(
    $createTextNode("This customizable text will always be there when the editor loads"),
  );
  root.append(paragraph);
}
