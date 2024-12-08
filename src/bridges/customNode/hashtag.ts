import { mergeAttributes, Node } from '@tiptap/core';
import { type DOMOutputSpec, Node as ProseMirrorNode } from '@tiptap/pm/model';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';

// See `addAttributes` below
export interface HashTagNodeAttrs {
  /**
   * The identifier for the selected item that was hashtaged, stored as a `data-id`
   * attribute.
   */
  id: string | null;
  /**
   * The label to be rendered by the editor as the displayed text for this hashtaged
   * item, if provided. Stored as a `data-label` attribute. See `renderLabel`.
   */
  value?: string | null;
}

export type HashTagOptions<
  SuggestionItem = any,
  Attrs extends Record<string, any> = HashTagNodeAttrs
> = {
  /**
   * The HTML attributes for a hashtag node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>;

  /**
   * A function to render the label of a hashtag.
   * @deprecated use renderText and renderHTML instead
   * @param props The render props
   * @returns The label
   * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.value ?? node.attrs.id}`
   */
  renderLabel?: (props: {
    options: HashTagOptions<SuggestionItem, Attrs>;
    node: ProseMirrorNode;
  }) => string;

  /**
   * A function to render the text of a hashtag.
   * @param props The render props
   * @returns The text
   * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.value ?? node.attrs.id}`
   */
  renderText: (props: {
    options: HashTagOptions<SuggestionItem, Attrs>;
    node: ProseMirrorNode;
  }) => string;

  /**
   * A function to render the HTML of a hashtag.
   * @param props The render props
   * @returns The HTML as a ProseMirror DOM Output Spec
   * @example ({ options, node }) => ['span', { 'data-type': 'hashtag' }, `${options.suggestion.char}${node.attrs.value ?? node.attrs.id}`]
   */
  renderHTML: (props: {
    options: HashTagOptions<SuggestionItem, Attrs>;
    node: ProseMirrorNode;
  }) => DOMOutputSpec;

  /**
   * Whether to delete the trigger character with backspace.
   * @default false
   */
  deleteTriggerWithBackspace: boolean;

  /**
   * The suggestion options.
   * @default {}
   * @example { char: '@', pluginKey: HashTagPluginKey, command: ({ editor, range, props }) => { ... } }
   */
  suggestion: Omit<SuggestionOptions<SuggestionItem, Attrs>, 'editor'>;
};

/**
 * The plugin key for the hashtag plugin.
 * @default 'hashtag'
 */
export const HashTagPluginKey = new PluginKey('hashtag');

export const HashTag = Node.create<HashTagOptions>({
  name: 'hashtag',

  priority: 102,

  addOptions() {
    return {
      HTMLAttributes: {},
      renderText({ options, node }) {
        return `${options.suggestion.char}${node.attrs.value ?? node.attrs.id}`;
      },
      deleteTriggerWithBackspace: false,
      renderHTML({ options, node }) {
        const mergedAttributes = mergeAttributes(
          {
            'class': 'mention',
            'data-denotation-char': '#',
            'data-index': 0,
            'target': '_blank',
          },
          options.HTMLAttributes,
          {
            'href': `${options.HTMLAttributes?.baseUrl}${node.attrs?.id}`,
            'data-href': `${options.HTMLAttributes?.baseUrl}${node.attrs?.id}`,
            'data-id': node.attrs.id,
            'data-value': node.attrs.value,
          }
        );
        return [
          'a',
          mergedAttributes,
          ['span', { contenteditable: 'false' }, `#${node.attrs.value}`],
        ];
      },
      suggestion: {
        char: '#',
        pluginKey: HashTagPluginKey,
        command: ({ editor, range, props }) => {
          // increase range.to by one when the next node is of type "text"
          // and starts with a space character
          const nodeAfter = editor.view.state.selection.$to.nodeAfter;
          const overrideSpace = nodeAfter?.text?.startsWith(' ');

          if (overrideSpace) {
            range.to += 1;
          }

          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: this.name,
                attrs: props,
              },
              {
                type: 'text',
                text: ' ',
              },
            ])
            .run();

          // get reference to `window` object from editor element, to support cross-frame JS usage
          editor.view.dom.ownerDocument.defaultView
            ?.getSelection()
            ?.collapseToEnd();
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const type = state.schema.nodes[this.name];
          if (type) {
            const allow = !!$from.parent.type.contentMatch.matchType(type);

            return allow;
          }
          return false;
        },
      },
    };
  },

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-id': attributes.id,
          };
        },
      },

      value: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-value'),
        renderHTML: (attributes) => {
          if (!attributes.value) {
            return {};
          }

          return {
            'data-value': attributes.value,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-denotation-char="#"]',
        getAttrs: (element) => {
          if (typeof element === 'string') {
            return {
              id: 'element',
              value: 'element',
            };
          }
          return {
            id: element.getAttribute('data-id'),
            value: element.getAttribute('data-value'),
          };
        },
        preserveWhitespace: 'full',
      },
    ];
  },

  renderHTML({ node }) {
    const mergedAttributes = mergeAttributes(
      {
        'class': 'mention',
        'data-denotation-char': '#',
        'data-index': 0,
        'target': '_blank',
      },
      this.options.HTMLAttributes,
      {
        'href': `${this.options.HTMLAttributes?.baseUrl}${node.attrs?.id}`,
        'data-href': `${this.options.HTMLAttributes?.baseUrl}${node.attrs?.id}`,
        'data-id': node.attrs.id,
        'data-value': node.attrs.value,
      }
    );
    return [
      'a',
      mergedAttributes,
      ['span', { contenteditable: 'false' }, `#${node.attrs.value}`],
    ];
  },

  renderText({ node }) {
    if (this.options.renderLabel !== undefined) {
      console.warn(
        'renderLabel is deprecated use renderText and renderHTML instead'
      );
      return this.options.renderLabel({
        options: this.options,
        node,
      });
    }
    return this.options.renderText({
      options: this.options,
      node,
    });
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isHashTag = false;
          const { selection } = state;
          const { empty, anchor } = selection;

          if (!empty) {
            return false;
          }
          // @ts-ignore
          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isHashTag = true;
              tr.insertText(
                this.options.deleteTriggerWithBackspace
                  ? ''
                  : this.options.suggestion.char || '',
                pos,
                pos + node.nodeSize
              );
              return false;
            }
          });

          return isHashTag;
        }),
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
