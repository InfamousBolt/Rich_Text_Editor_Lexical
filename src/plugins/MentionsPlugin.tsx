import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  QueryMatch,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode, $getSelection, $createTextNode } from "lexical";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";
// @ts-ignore
import { $createMentionNode } from "../nodes/MentionNode.ts";

const PUNCTUATION =
  "\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%'\"~=<>_:;";
const NAME = "\\b[A-Z][^\\s" + PUNCTUATION + "]";

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const CapitalizedNameMentionsRegex = new RegExp(
  "(^|[^#])((?:" + DocumentMentionsRegex.NAME + "{" + 1 + ",})$)"
);

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGERS = ["@"].join("");

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = "[^" + TRIGGERS + PUNC + "\\s]";

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  "(?:" +
  "\\.[ |$]|" + // E.g. "r. " in "Mr. Smith"
  " |" + // E.g. " " in "Josh Duck"
  "[" +
  PUNC +
  "]|" + // E.g. "-' in "Salier-Hellendag"
  ")";

const LENGTH_LIMIT = 75;

const AtSignMentionsRegex = new RegExp(
  "(^|\\s|\\()(" +
    "[" +
    TRIGGERS +
    "]" +
    "((?:" +
    VALID_CHARS +
    VALID_JOINS +
    "){0," +
    LENGTH_LIMIT +
    "})" +
    ")$"
);

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50;

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  "(^|\\s|\\()(" +
    "[" +
    TRIGGERS +
    "]" +
    "((?:" +
    VALID_CHARS +
    "){0," +
    ALIAS_LENGTH_LIMIT +
    "})" +
    ")$"
);

// At most, 5 suggestions are shown in the popup.
// const SUGGESTION_LIST_LENGTH_LIMIT = dummyMentionsData.length;

const mentionsCache = new Map();

export const dummyMentionsData: {
  name: string;
  id: string;
  deleted: boolean;
}[] = [
  { name: "Aayla Secura", id: "123", deleted: false },
  { name: "Admiral Dodd Rancit", id: "124", deleted: false },
  { name: "Aurra Sing", id: "125", deleted: true },
  { name: "BB-8", id: "126", deleted: false },
  { name: "Bo-Katan Kryze", id: "127", deleted: false },
];

const SUGGESTION_LIST_LENGTH_LIMIT = dummyMentionsData.length;

const dummyLookupService = {
  search(
    string: string,
    callback: (
      results: Array<{ name: string; id: string; deleted: boolean }>
    ) => void
  ): void {
    setTimeout(() => {
      const results = dummyMentionsData.filter((mention) =>
        mention.name.toLowerCase().includes(string.toLowerCase())
      );
      callback(results.map((mention) => mention));
    }, 500);
  },
};

function useMentionLookupService(mentionString: string | null) {
  const [results, setResults] = useState<
    Array<{ name: string; id: string; deleted: boolean }>
  >([]);

  useEffect(() => {
    const mention = !!mentionString ? mentionString : "";
    const cachedResults = mentionsCache.get(mentionString);
    console.log(mention);

    if (cachedResults === null) {
      return;
    } else if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    mentionsCache.set(mention, null);
    dummyLookupService.search(mention, (newResults) => {
      mentionsCache.set(mention, newResults);
      setResults(newResults);
      setResults((prevResults) => {
        return prevResults.filter((result) => result.deleted === false);
      });
    });
  }, [mentionString]);
  console.log(results);

  return results;
}

function checkForCapitalizedNameMentions(
  text: string,
  minMatchLength: number
): QueryMatch | null {
  const match = CapitalizedNameMentionsRegex.exec(text);
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[2];
    if (matchingString != null && matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: matchingString,
      };
    }
  }
  return null;
}

function checkForAtSignMentions(
  text: string,
  minMatchLength: number
): QueryMatch | null {
  let match = AtSignMentionsRegex.exec(text);

  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text);
  }
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[3];
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }
  return null;
}

function getPossibleQueryMatch(text: string): QueryMatch | null {
  const match = checkForAtSignMentions(text, 0);
  return match === null ? checkForCapitalizedNameMentions(text, 100) : match;
}

class MentionTypeaheadOption extends TypeaheadOption {
  user: { name: string; id: string; deleted: boolean };
  name: string;
  picture: JSX.Element;
  email: string;

  constructor(
    user: { name: string; id: string; deleted: boolean },
    name: string,
    picture: JSX.Element,
    email: string
  ) {
    super(name);
    this.user = user;
    this.name = name;
    this.picture = picture;
    this.email = email;
  }
}

function MentionsTypeaheadMenuItem({
  queryString,
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  queryString: string;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: MentionTypeaheadOption;
}) {
  let className = "item";
  const partsName = option.name.split(new RegExp(`(${queryString})`, "gi"));
  const partsEmail = option.email.split(new RegExp(`(${queryString})`, "gi"));
  // console.log(queryString)

  if (isSelected) {
    className += " selected";
  }

  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {/* {option.picture} */}

      <i className="user" style={{ height: "20px", width: "20px" }} />

      <span>
        {partsName.map((part) =>
          part.toLowerCase() === queryString.toLowerCase() ? (
            <b>{part}</b>
          ) : (
            part
          )
        )}
      </span>
      <span>
        {partsEmail.map((part) =>
          part.toLowerCase() === queryString.toLowerCase() ? (
            <b>{part}</b>
          ) : (
            part
          )
        )}
      </span>
    </li>
  );
}

export default function MentionsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);
  // console.log(queryString);

  //take query string and return object with name and id
  const results = useMentionLookupService(queryString);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(
    () =>
      results
        .map(
          (result) =>
            new MentionTypeaheadOption(
              { name: result.name, id: result.id, deleted: result.deleted },
              result.name,
              <i />,
              result.name
            )
        )
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results]
  );

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        //creates node with the mention
        const mentionNode = $createMentionNode(
          selectedOption.user.deleted,
          selectedOption.user,
          selectedOption.name
        );
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        mentionNode.select();
        const selection = $getSelection();

        selection.insertNodes([$createTextNode(" ")]);
        closeMenu();
      });
    },
    [editor]
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const mentionMatch = getPossibleQueryMatch(text);
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      return !slashMatch && mentionMatch ? mentionMatch : null;
    },
    [checkForSlashTriggerMatch, editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef && results.length
          ? ReactDOM.createPortal(
              <div className="typeahead-popover mentions-menu">
                <ul>
                  {options.map((option, i: number) =>
                    option.user.deleted ? null : (
                      <MentionsTypeaheadMenuItem
                        queryString={queryString}
                        index={i}
                        isSelected={selectedIndex === i}
                        onClick={() => {
                          setHighlightedIndex(i);
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => {
                          setHighlightedIndex(i);
                        }}
                        key={option.key}
                        option={option}
                      />
                    )
                  )}
                </ul>
              </div>,
              anchorElementRef
            )
          : null
      }
    />
  );
}
