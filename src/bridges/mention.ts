import { Mention, MentionPluginKey } from './customNode/mention';

import BridgeExtension from './base';

type MentionEditorState = {
  queryMention?: string | null;
};

type MentionEditorInstance = {
  insertMention: (payload: { id: string; label: string }) => void;
};

declare module '../types/EditorBridge' {
  interface BridgeState extends MentionEditorState {}
  interface EditorBridge extends MentionEditorInstance {}
}

export enum MentionEditorActionType {
  InsertMention = 'insert-Mention',
}

type MentionMessage = {
  type: MentionEditorActionType.InsertMention;
  payload: { id: string; label: string };
};

export const MentionBridge = new BridgeExtension<
  MentionEditorState,
  MentionEditorInstance,
  MentionMessage
>({
  forceName: 'mention',
  tiptapExtension: Mention,
  onBridgeMessage: (editor, message) => {
    if (message.type === MentionEditorActionType.InsertMention) {
      const state = MentionPluginKey.getState(editor.state);
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
            type: 'mention',
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
      insertMention: (params) =>
        sendBridgeMessage({
          type: MentionEditorActionType.InsertMention,
          payload: params,
        }),
    };
  },
  extendEditorState: (editor) => {
    return {
      queryMention: MentionPluginKey.getState(editor.state)?.query,
    };
  },
});
