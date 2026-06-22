import React, {ReactNode} from 'react';

import {Text, View} from 'react-native';

import SimpleMarkdown, {
  Capture,
  Output,
  Parser,
  SingleASTNode,
  State,
} from 'simple-markdown';
import map from 'lodash.map';
import includes from 'lodash.includes';
import head from 'lodash.head';
import some from 'lodash.some';
import size from 'lodash.size';
import {PSMarkdownProps} from './PSMarkdown';

const LINK_INSIDE = '(?:\\[[^\\]]*\\]|[^\\]]|\\](?=[^\\[]*\\]))*';
const LINK_HREF_AND_TITLE =
  '\\s*<?([^\\s]*?)>?(?:\\s+[\'"]([\\s\\S]*?)[\'"])?\\s*';

export const PSMarkdownRules = (
  props: PSMarkdownProps,
): SimpleMarkdown.OutputRules<Object> => {
  return {
    heading: {
      match: SimpleMarkdown.blockRegex(/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n *)+/),
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        state.withinText = true;
        state.withinHeading = true;

        state.style = {
          ...(state.style || {}),
          // @ts-ignore
          ...props['heading' + node.level + 'Style'],
        };

        return React.createElement(
          Text,
          {
            key: state.key,
            style: state.style,
          },
          output(node.content, state),
        );
      },
    },
    hr: {
      match: () => {
        return null;
      },
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        return null;
      },
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        // https://github.com/mattcone/markdown-guide/blob/master/_basic-syntax/horizontal-rules.md
        // return React.createElement(View, {
        //   key: state.key,
        //   style: props.hrStyle,
        // });
        return unsupported(node, output, state);
      },
    },
    codeBlock: {
      match: SimpleMarkdown.blockRegex(new RegExp(/^```([\s\S]*?)```/)),
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        return {
          content: _capture[1]?.trim(),
        };
      },
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        // state.withinText = true;
        state.withinCodeBlock = true;
        return React.createElement(
          View,
          {
            key: state.key,
            style: {
              backgroundColor: '#F5F5F5',
              padding: 10,
              borderRadius: 5,
              marginVertical: 10,
            },
          },
          React.createElement(
            Text,
            {
              style: {
                fontFamily: 'Courier',
                fontSize: 18,
                color: '#333',
              },
            },
            node.content,
          ),
        );
      },
    },
    blockQuote: {
      match: () => {
        return null;
      },
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        return null;
      },
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        // state.withinQuote = true;

        // const verticalBar = React.createElement(View, {
        //   key: `PSMarkdownBlockQuoteVerticalBar-${state.key}`,
        //   style: props.blockQuoteVerticalBarStyle,
        // });

        // const blockQuote = React.createElement(
        //   Text,
        //   {
        //     key: state.key,
        //     style: props.blockQuoteTextStyle,
        //   },
        //   output(node.content, state),
        // );

        // return React.createElement(
        //   View,
        //   {
        //     key: state.key,
        //     style: [props.blockQuoteSectionStyle, props.blockQuoteTextStyle],
        //   },
        //   [verticalBar, blockQuote],
        // );
        return unsupported(node, output, state);
      },
    },
    list: {
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        // console.log(`list: node = ${JSON.stringify(node)}, state = ${state}`);
        let numberIndex = 1;
        const items = map(node.items, (item, i) => {
          let bullet: React.ReactElement;
          state.withinList = false;

          if (node.ordered) {
            bullet = React.createElement(
              Text,
              {key: 0, style: props.listItemNumberStyle},
              numberIndex + '. ',
            );
          } else {
            bullet = React.createElement(
              Text,
              {key: 0, style: props.listItemBulletStyle},
              ' \u2022  ',
            );
          }

          if (item.length > 1) {
            if (item[1].type === 'list') {
              state.withinList = true;
            }
          }

          // Xoá new line ở item có subList
          const firstObj = item[0];
          if (firstObj) {
            const firstContent = firstObj.content;
            if (
              typeof firstContent === 'string' &&
              firstContent.endsWith('\n')
            ) {
              firstObj.content = firstContent.replace('\n', '');
            }
          }

          const content = output(item, state);
          let listItem: React.ReactElement;
          if (
            includes(
              ['text', 'paragraph', 'strong'],
              // @ts-ignore
              (head(item) || {}).type,
            ) &&
            state.withinList === false
          ) {
            state.withinList = true;
            listItem = React.createElement(
              Text,
              {
                style: [props.listItemTextStyle, {marginBottom: 0}],
                key: 1,
              },
              content,
            );
          } else {
            listItem = React.createElement(
              View,
              {
                style: props.listItemTextStyle,
                key: 1,
              },
              content,
            );
          }
          state.withinList = false;
          numberIndex++;

          return React.createElement(
            View,
            {
              key: i,
              style: props.listRowStyle,
            },
            [bullet, listItem],
          );
        });

        return React.createElement(
          View,
          {key: state.key, style: props.listStyle},
          items,
        );
      },
    },
    sublist: {
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        // const items = map(node.items, (item, i) => {
        //   let bullet: React.ReactElement;
        //   if (node.ordered) {
        //     bullet = React.createElement(
        //       Text,
        //       {key: 0, style: props.listItemNumber},
        //       i + 1 + '. ',
        //     );
        //   } else {
        //     bullet = React.createElement(
        //       Text,
        //       {key: 0, style: props.listItemBullet},
        //       '  \u2022   ',
        //     );
        //   }

        //   const content = output(item, state);
        //   let listItem: React.ReactElement;
        //   state.withinList = true;
        //   if (
        //     // @ts-ignore
        //     includes(['text', 'paragraph', 'strong'], (head(item) || {}).type)
        //   ) {
        //     listItem = React.createElement(
        //       Text,
        //       {
        //         style: props.listItemText,
        //         key: 1,
        //       },
        //       content,
        //     );
        //   } else {
        //     listItem = React.createElement(
        //       View,
        //       {
        //         style: props.listItem,
        //         key: 1,
        //       },
        //       content,
        //     );
        //   }
        //   state.withinList = false;
        //   return React.createElement(
        //     View,
        //     {
        //       key: i,
        //       style: props.listRow,
        //     },
        //     [bullet, listItem],
        //   );
        // });

        // return React.createElement(
        //   View,
        //   {key: state.key, style: props.sublist},
        //   items,
        // );
        return unsupported(node, output, state);
      },
    },
    table: {
      match: () => {
        return null;
      },
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        return null;
      },
      react: (
        node: SingleASTNode,
        output: Output<ReactNode[]>,
        state: State,
      ) => {
        return unsupported(node, output, state);
      },
    },
    tableSeparator: {
      match: () => {
        return null;
      },
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        return null;
      },
      react: (
        node: SingleASTNode,
        output: Output<ReactNode[]>,
        state: State,
      ) => {
        return unsupported(node, output, state);
      },
    },
    nptable: {
      match: () => {
        return null;
      },
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        return null;
      },
      react: (
        node: SingleASTNode,
        output: Output<ReactNode[]>,
        state: State,
      ) => {
        return unsupported(node, output, state);
      },
    },
    fence: {
      match: () => {
        return null;
      },
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        return null;
      },
      react: (
        node: SingleASTNode,
        output: Output<ReactNode[]>,
        state: State,
      ) => {
        return unsupported(node, output, state);
      },
    },
    newline: {
      react: (
        _node: SingleASTNode,
        _output: Output<ReactNode[]>,
        {...state},
      ) => {
        return React.createElement(
          Text,
          {
            key: state.key,
            style: props.newlineStyle,
          },
          '\n\n',
        );
      },
    },
    br: {
      react: (
        _node: SingleASTNode,
        _output: Output<ReactNode[]>,
        {...state},
      ) => {
        return React.createElement(
          Text,
          {
            key: state.key,
            style: props.brStyle,
          },
          '\n\n',
        );
      },
    },
    paragraph: {
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        // console.log(
        //   `paragraph: node = ${JSON.stringify(node)}, state = ${state}`,
        // );

        let paragraphStyle = props.paragraphStyle;
        // if (size(node.content) < 3 && some(node.content, {type: 'strong'})) {
        // align to center for Strong only content
        // require a check of content array size below 3,
        // as parse will include additional space as `text`
        // paragraphStyle = props.paragraphCenter;
        // }
        const finalStyle = [
          ...[paragraphStyle],
          {
            // marginTop: state.key === '0' ? 0 : (12).px(),
            // marginBottom: 0,
          },
        ];
        if (state.withinList) {
          // @ts-ignore
          finalStyle.push(...[paragraphStyle, props.noMargin]);
        } else {
          // @ts-ignore
          finalStyle.push(...[paragraphStyle]);
        }
        return React.createElement(
          Text,
          {
            key: state.key,
            style: finalStyle,
          },
          output(node.content, state),
        );
      },
    },
    link: {
      match: SimpleMarkdown.inlineRegex(
        new RegExp(
          '^\\[(' + LINK_INSIDE + ')\\]\\(' + LINK_HREF_AND_TITLE + '\\)',
        ),
      ),
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        state.withinText = true;
        state.withinLink = true;
        const _pressHandler = () => {
          props.onUrlPress?.(node.target);
        };
        const _longPressHandler = () => {
          props.onUrlLongPress?.(node.target);
        };
        return React.createElement(
          Text,
          {
            key: state.key,
            style: props.linkStyle,
            onPress: _pressHandler,
            onLongPress: _longPressHandler,
          },
          output(node.content, state),
        );
      },
    },
    mailto: {
      parse: (capture: Capture, _parse: Parser, _state: State) => {
        var address = capture[1];
        var target = capture[1];
        return {
          type: 'email',
          content: [
            {
              type: 'text',
              content: address,
            },
          ],
          target: target,
        };
      },
    },
    email: {
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        state.withinText = true;
        state.withinEmail = true;
        const _pressHandler = () => {
          props.onEmailPress?.(node.target);
        };
        const _longPressHandler = () => {
          props.onEmailLongPress?.(node.target);
        };
        return React.createElement(
          Text,
          {
            key: state.key,
            style: props.emailStyle,
            onPress: _pressHandler,
            onLongPress: _longPressHandler,
          },
          output(node.content, state),
        );
      },
    },
    image: {
      match: () => {
        return null;
      },
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        return null;
      },
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        return unsupported(node, output, state);
      },
    },
    reflink: {
      match: () => {
        return null;
      },
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        return null;
      },
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        return unsupported(node, output, state);
      },
    },
    refimage: {
      match: () => {
        return null;
      },
      parse: (_pressHandlercapture: Capture, _parse: Parser, _state: State) => {
        return null;
      },
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        return unsupported(node, output, state);
      },
    },
    em: {
      // Emphasis: https://www.codecademy.com/resources/docs/markdown/emphasis
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        state.withinText = true;
        state.withinEm = true;
        state.style = {
          ...(state.style || {}),
          ...props.emStyle,
        };
        return React.createElement(
          Text,
          {
            key: state.key,
            style: props.emStyle,
          },
          output(node.content, state),
        );
      },
    },
    strong: {
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        state.withinText = true;
        state.withinStrong = true;

        let finalStyle = {};

        if (state.withinHeading) {
          finalStyle = {
            ...(state.style || {}),
          };
        } else {
          finalStyle = {
            ...(state.style || {}),
            ...props.strongStyle,
          };
        }

        return React.createElement(
          Text,
          {
            key: state.key,
            style: finalStyle,
          },
          output(node.content, state),
        );
      },
    },
    u: {
      // https://www.w3schools.com/tags/tag_u.asp
      match: () => {
        return null;
      },
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        return null;
      },
      // u will to the same as strong, to avoid the View nested inside text problem
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        // state.withinText = true;
        // state.style = {
        //   ...(state.style || {}),
        //   ...props.u,
        // };
        // return React.createElement(
        //   Text,
        //   {
        //     key: state.key,
        //     style: props.strong,
        //   },
        //   output(node.content, state),
        // );
        return unsupported(node, output, state);
      },
    },
    del: {
      // https://www.w3schools.com/tags/tag_del.asp
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        state.withinText = true;
        return React.createElement(
          Text,
          {
            key: state.key,
            style: props.delStyle,
          },
          output(node.content, state),
        );
      },
    },
    inlineCode: {
      match: () => {
        return null;
      },
      parse: (_capture: Capture, _parse: Parser, _state: State) => {
        // const content = capture[2];
        // if (!content) {
        //   return undefined;
        // }
        // const isCurrentlyInline = state.inline || false;
        // state.inline = true;
        // const result = parse(content, state);
        // state.inline = isCurrentlyInline;
        // return {
        //   content: result,
        // };
        return null;
      },
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        // state.withinText = true;
        // state.withinInlineCode = true;
        // return React.createElement(
        //   Text,
        //   {
        //     key: state.key,
        //     style: props.inlineCodeStyle,
        //   },
        //   output(node.content, state),
        // );
        return unsupported(node, output, state);
      },
    },
    mention: {
      order: SimpleMarkdown.defaultRules.text.order - 0.5,
      match: SimpleMarkdown.inlineRegex(new RegExp(/^\[(@[^:]+):([^\]]+)\]/gi)),
      parse: (capture: Capture, _parse: Parser, _state: State) => {
        var name = capture[1];
        var id = capture[2];
        return {
          type: 'mention',
          content: [
            {
              type: 'text',
              content: name,
            },
          ],
          target: id,
        };
      },
      react: (node: SingleASTNode, output: Output<ReactNode[]>, {...state}) => {
        state.withinText = true;
        state.withinMention = true;
        const _pressHandler = () => {
          props.onMentionPress?.(node.target);
        };
        const _longPressHandler = () => {
          props.onMentionLongPress?.(node.target);
        };
        return React.createElement(
          Text,
          {
            key: state.key,
            style: props.mentionStyle,
            onPress: _pressHandler,
            onLongPress: _longPressHandler,
          },
          output(node.content, state),
        );
      },
    },
    text: {
      react: (
        node: SingleASTNode,
        _output: Output<ReactNode[]>,
        {...state},
      ) => {
        // console.log(`text: node = ${JSON.stringify(node)}, state = ${state}`);

        let textStyle = {
          ...props.textStyle,
          ...(state.style || {}),
        };

        const finalStyle = [textStyle];

        if (state.withinMention) {
          finalStyle.push(props.mentionStyle);
        }

        if (state.withinLink) {
          finalStyle.push(props.linkStyle);
        }

        if (state.withinEmail) {
          finalStyle.push(props.emailStyle);
        }

        // if (state.withinInlineCode) {
        //   finalStyle.push(props.inlineCodeStyle);
        // }

        // if (state.withinQuote) {
        //   finalStyle.push(props.blockQuoteTextStyle);
        // }

        if (state.withinStrong && !state.withinHeading) {
          if (state.withinEm) {
            finalStyle.push(props.strongAndEmStyle);
          } else {
            finalStyle.push(props.strongStyle);
          }
        }

        return React.createElement(
          Text,
          {
            key: `PSMarkdown-${state.key}`,
            style: finalStyle,
          },
          node.content,
        );
      },
    },
  };
};

const unsupported = (
  node: SingleASTNode,
  output: Output<ReactNode[]>,
  state: State,
) => {
  if (typeof node.content === 'string') {
    return node.content;
  } else if (Array.isArray(node.content)) {
    return output(node.content, state);
  } else {
    return null;
  }
};
