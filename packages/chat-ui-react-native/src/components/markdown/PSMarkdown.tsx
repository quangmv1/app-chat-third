/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import SimpleMarkdown from 'simple-markdown';
import isEqual from 'react-fast-compare';
import merge from 'lodash.merge';
import {ScrollView, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import {PSMarkdownStyles, psMarkdownStyles} from './PSMarkdownStyles';
import {PSMarkdownRules} from './PSMarkdownRules';
import {RICH_TEXT, psLogger} from '../../utils';
import {useDeepCompareMemoize} from '../../hooks';

export const PSMarkdownScreen = () => {
  removeMarkdown(MARKDOWN, {
    stripListLeaders: true, // strip list leaders (default: true)
    listUnicodeChar: '', // char to insert instead of stripped list leaders (default: '')
    gfm: true, // support GitHub-Flavored Markdown (default: true)
    useImgAltText: true, // replace images with alt-text, if present (default: true)
  });
  psLogger.error(
    `plainText = ${removeMarkdown(MARKDOWN, {
      stripListLeaders: true, // strip list leaders (default: true)
      listUnicodeChar: '', // char to insert instead of stripped list leaders (default: '')
      gfm: true, // support GitHub-Flavored Markdown (default: true)
      useImgAltText: true, // replace images with alt-text, if present (default: true)
    })}`,
  );
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{
        backgroundColor: 'white',
      }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F5FCFF',
          paddingHorizontal: (16).px(),
        }}>
        <PSMarkdown
          text={MARKDOWN + RICH_TEXT}
          containerStyle={{
            alignSelf: 'stretch',
          }}
        />
      </View>
    </ScrollView>
  );
};

export type PSMarkdownProps = PSMarkdownStyles & {
  text: string;
  containerStyle?: StyleProp<ViewStyle>;
  mentionStyle?: TextStyle;
  onMentionPress?: (mentionId: string) => void;
  onMentionLongPress?: (mentionId: string) => void;
  onEmailPress?: (email: string) => void;
  onEmailLongPress?: (email: string) => void;
  onUrlPress?: (url: string) => void;
  onUrlLongPress?: (url: string) => void;
};

export const PSMarkdown = React.memo(
  (props: PSMarkdownProps) => {
    const rules = React.useMemo(() => {
      return merge(
        {},
        SimpleMarkdown.defaultRules,
        PSMarkdownRules(merge({}, psMarkdownStyles, props)),
      );
    }, [useDeepCompareMemoize(props)]);

    const parser = React.useMemo(() => {
      return SimpleMarkdown.parserFor(rules);
    }, [rules]);

    const parse = React.useCallback(
      (source: string) => {
        const blockSource = source + '\n\n';
        return parser(blockSource, {inline: false});
      },
      [parser],
    );

    const tree = React.useMemo(() => {
      return parse(props.text);
    }, [parse, props.text]);

    const children = React.useMemo(() => {
      const renderer = SimpleMarkdown.outputFor(rules, 'react');
      return renderer(tree);
    }, [rules, tree]);

    return <View style={[props.containerStyle]}>{children}</View>;
  },
  (prev, next) => isEqual(prev, next),
);

// https://www.npmjs.com/package/remove-markdown
// removeMarkdown(MARKDOWN, {
//   stripListLeaders: true, // strip list leaders (default: true)
//   listUnicodeChar: '', // char to insert instead of stripped list leaders (default: '')
//   gfm: true, // support GitHub-Flavored Markdown (default: true)
//   useImgAltText: true, // replace images with alt-text, if present (default: true)
// });
export const removeMarkdown = (
  md: string,
  options?: {
    listUnicodeChar?: string;
    stripListLeaders?: boolean;
    gfm?: boolean;
    useImgAltText?: boolean;
    abbr?: boolean;
    replaceLinksWithURL?: boolean;
    htmlTagsToSkip?: string[];
  },
) => {
  options = options || {};
  options.listUnicodeChar = options.hasOwnProperty('listUnicodeChar')
    ? options.listUnicodeChar
    : '';
  options.stripListLeaders = options.hasOwnProperty('stripListLeaders')
    ? options.stripListLeaders
    : true;
  options.gfm = options.hasOwnProperty('gfm') ? options.gfm : true;
  options.useImgAltText = options.hasOwnProperty('useImgAltText')
    ? options.useImgAltText
    : true;
  options.abbr = options.hasOwnProperty('abbr') ? options.abbr : false;
  options.replaceLinksWithURL = options.hasOwnProperty('replaceLinksWithURL')
    ? options.replaceLinksWithURL
    : false;
  options.htmlTagsToSkip = options.hasOwnProperty('htmlTagsToSkip')
    ? options.htmlTagsToSkip
    : [];

  let output = md || '';

  // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
  output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*/gm, '');

  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar) {
        output = output.replace(
          /^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm,
          options.listUnicodeChar + ' $1',
        );
      } else {
        output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, '$1');
      }
    }
    if (options.gfm) {
      output = output
        // Header
        .replace(/\n={2,}/g, '\n')
        // Fenced codeblocks
        .replace(/~{3}.*\n/g, '')
        // Strikethrough
        .replace(/~~/g, '')
        // Fenced codeblocks
        .replace(/`{3}.*\n/g, '');
    }
    if (options.abbr) {
      // Remove abbreviations
      output = output.replace(/\*\[.*\]:.*\n/, '');
    }
    output = output
      // Remove HTML tags
      .replace(/<[^>]*>/g, '');

    let htmlReplaceRegex = new RegExp('<[^>]*>', 'g');
    if (options.htmlTagsToSkip!.length > 0) {
      // Using negative lookahead. Eg. (?!sup|sub) will not match 'sup' and 'sub' tags.
      const joinedHtmlTagsToSkip =
        '(?!' + options.htmlTagsToSkip!.join('|') + ')';

      // Adding the lookahead literal with the default regex for html. Eg./<(?!sup|sub)[^>]*>/ig
      htmlReplaceRegex = new RegExp(
        '<' + joinedHtmlTagsToSkip + '[^>]*>',
        'ig',
      );
    }

    output = output
      // Remove HTML tags
      .replace(htmlReplaceRegex, '')
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, '')
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, '')
      .replace(/\s{0,2}\[.*?\]: .*?$/g, '')
      // Remove images
      .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? '$1' : '')
      // Remove inline links
      .replace(
        /\[([^\]]*?)\][\[\(].*?[\]\)]/g,
        options.replaceLinksWithURL ? '$2' : '$1',
      )
      // Remove blockquotes
      .replace(/^(\n)?\s{0,3}>\s?/gm, '$1')
      // .replace(/(^|\n)\s{0,3}>\s?/g, '\n\n')
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, '')
      // Remove atx-style headers
      .replace(
        /^(\n)?\s{0,}#{1,6}\s*( (.+))? +#+$|^(\n)?\s{0,}#{1,6}\s*( (.+))?$/gm,
        '$1$3$4$6',
      )
      // Remove * emphasis
      .replace(/([\*]+)(\S)(.*?\S)??\1/g, '$2$3')
      // Remove _ emphasis. Unlike *, _ emphasis gets rendered only if
      //   1. Either there is a whitespace character before opening _ and after closing _.
      //   2. Or _ is at the start/end of the string.
      .replace(/(^|\W)([_]+)(\S)(.*?\S)??\2($|\W)/g, '$1$3$4$5')
      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/gm, '$2')
      // Remove inline code
      .replace(/`(.+?)`/g, '$1')
      // // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
      // .replace(/\n{2,}/g, '\n\n')
      // // Remove newlines in a paragraph
      // .replace(/(\S+)\n\s*(\S+)/g, '$1 $2')
      // Replace strike through
      .replace(/~(.*?)~/g, '$1');
  } catch (e) {
    psLogger.error('removeMarkdown', e);
    return md;
  }
  return output;
};

export const MARKDOWN = `# This is Heading 1
## This is Heading 2
### This is Heading 3
#### This is Heading 4
##### This is Heading 5
###### This is Heading 6

---

This is a \`inline\`  Test. [@KienPiScale:69]

---

1. List1
2. List2
  * test
  * test
3. List3
4. List4

---

* Bullet 1
* Bullet 2
  * Bullet 2a
  * Bullet 2b
  * Bullet 2c
* Bullet 3

---

You can also put some url as a link [like This](https://www.google.com) or [@KienHT:70] write it as a plain text:
https://www.google.com
<mailme@gmail.com>

---

This text should be printed between horizontal rules

---

The following code is an example for codeblock:

    const a = function() {
      runSomeFunction()
    };

Below is some example to print blockquote

> Test block Quote
> Another  block Quote

this is _italic_ 
this is **strong**
Some *really* ~~basic~~ **Markdown**.`;
