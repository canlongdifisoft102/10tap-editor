import { mergeAttributes, Node } from '@tiptap/core';
import { type DOMOutputSpec, Node as ProseMirrorNode } from '@tiptap/pm/model';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';

// See `addAttributes` below
export interface MentionNodeAttrs {
  /**
   * The identifier for the selected item that was mentioned, stored as a `data-id`
   * attribute.
   */
  id: string | null;
  /**
   * The label to be rendered by the editor as the displayed text for this mentioned
   * item, if provided. Stored as a `data-label` attribute. See `renderLabel`.
   */
  value?: string | null;
}

export type MentionOptions<
  SuggestionItem = any,
  Attrs extends Record<string, any> = MentionNodeAttrs
> = {
  /**
   * The HTML attributes for a mention node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>;

  /**
   * A function to render the label of a mention.
   * @deprecated use renderText and renderHTML instead
   * @param props The render props
   * @returns The label
   * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
   */
  renderLabel?: (props: {
    options: MentionOptions<SuggestionItem, Attrs>;
    node: ProseMirrorNode;
  }) => string;

  /**
   * A function to render the text of a mention.
   * @param props The render props
   * @returns The text
   * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
   */
  renderText: (props: {
    options: MentionOptions<SuggestionItem, Attrs>;
    node: ProseMirrorNode;
  }) => string;

  /**
   * A function to render the HTML of a mention.
   * @param props The render props
   * @returns The HTML as a ProseMirror DOM Output Spec
   * @example ({ options, node }) => ['span', { 'data-type': 'mention' }, `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`]
   */
  renderHTML: (props: {
    options: MentionOptions<SuggestionItem, Attrs>;
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
   * @example { char: '@', pluginKey: MentionPluginKey, command: ({ editor, range, props }) => { ... } }
   */
  suggestion: Omit<SuggestionOptions<SuggestionItem, Attrs>, 'editor'>;
};

/**
 * The plugin key for the mention plugin.
 * @default 'mention'
 */
export const MentionPluginKey = new PluginKey('mention');

/**
 * This extension allows you to insert mentions into the editor.
 * @see https://www.tiptap.dev/api/extensions/mention
 */
export const Mention = Node.create<MentionOptions>({
  name: 'mention',
  priority: 101,
  addOptions() {
    return {
      HTMLAttributes: {},
      renderText({ options, node }) {
        return `${options.suggestion.char}${node.attrs.value ?? node.attrs.id}`;
      },
      deleteTriggerWithBackspace: true,
      renderHTML({ options, node }) {
        const mergedAttributes = mergeAttributes(
          {
            'class': 'mention',
            'data-denotation-char': '@',
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
          [
            'span',
            {
              contenteditable: 'false',
            },
            `@${node.attrs.value}`,
          ],
        ];
      },
      suggestion: {
        char: '@',
        pluginKey: MentionPluginKey,
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
        tag: 'a[data-denotation-char="@"]',
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
        'data-denotation-char': '@',
        'data-index': 0,
        'target': '_blank',
      },
      this.options.HTMLAttributes,
      {
        'data-id': node.attrs.id,
        'data-value': node.attrs.value,
        'href': `${this.options.HTMLAttributes?.baseUrl}${node.attrs?.id}`,
        'data-href': `${this.options.HTMLAttributes?.baseUrl}${node.attrs?.id}`,
        'data-index': '0',
      }
    );
    return [
      'a',
      mergedAttributes,
      ['span', { contenteditable: 'false' }, `@${node.attrs.value}`],
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
          let isMention = false;
          const { selection } = state;
          const { empty, anchor } = selection;

          if (!empty) {
            return false;
          }
          // @ts-ignore
          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true;
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

          return isMention;
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
