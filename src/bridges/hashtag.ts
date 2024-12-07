import { HashTag } from './customNode/hashtag';

import { PluginKey } from '@tiptap/pm/state';
import BridgeExtension from './base';

type HashTagEditorState = {
  queryHashTag?: string | null;
};

type HashTagEditorInstance = {
  insertHashTag: (payload: { id: string; label: string }) => void;
};

declare module '../types/EditorBridge' {
  interface BridgeState extends HashTagEditorState {}
  interface EditorBridge extends HashTagEditorInstance {}
}

export enum HashTagEditorActionType {
  InsertHashTag = 'insert-HashTag',
}

export const HashTagPluginKey = new PluginKey('hashtag');

type HashTagMessage = {
  type: HashTagEditorActionType.InsertHashTag;
  payload: { id: string; label: string };
};

export const HashTagBridge = new BridgeExtension<
  HashTagEditorState,
  HashTagEditorInstance,
  HashTagMessage
>({
  forceName: 'hashtag',
  tiptapExtension: HashTag.configure({
    deleteTriggerWithBackspace: true,
    suggestion: {
      char: '#',
      pluginKey: HashTagPluginKey,
    },
    renderHTML({ options, node }) {
      return [
        'a',
        {
          'class': 'mention',
          'href': `${options.HTMLAttributes?.baseUrl}${node.attrs?.id}`,
          'target': '_blank',
          'data-index': '0',
          'data-denotation-char': '#',
          'data-id': node.attrs?.id,
          'data-value': node.attrs?.value,
          'data-href': `${options.HTMLAttributes?.baseUrl}${node.attrs?.id}`,
        },
        [
          'span',
          {
            contenteditable: 'false',
          },
          `#${node.attrs.value}`,
        ],
      ];
    },
  }),
  onBridgeMessage: (editor, message) => {
    if (message.type === HashTagEditorActionType.InsertHashTag) {
      const state = HashTagPluginKey.getState(editor.state);
      const nodeAfter = editor.view.state.selection.$to.nodeAfter;
      const overrideSpace = nodeAfter?.text?.startsWith(' ');
      const range = state.range;
      if (overrideSpace) {
        range.to += 1;
      }
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: 'hashtag',
            attrs: {
              value: message.payload.label,
              id: message.payload.id,
            },
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run();
      // get reference to `window` object from editor element, to support cross-frame JS usage
      // editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd();
      return false;
    }
    return false;
  },
  extendEditorInstance: (sendBridgeMessage) => {
    return {
      insertHashTag: (params) =>
        sendBridgeMessage({
          type: HashTagEditorActionType.InsertHashTag,
          payload: params,
        }),
    };
  },
  extendEditorState: (editor) => {
    return {
      queryHashTag: HashTagPluginKey.getState(editor.state)?.query,
    };
  },
});
