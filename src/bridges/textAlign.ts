import TextAlign from '@tiptap/extension-text-align';

import BridgeExtension from './base';

type TextAlignEditorState = {
  isTextAlignLeft: boolean;
  isTextAlignRight: boolean;
  isTextAlignCenter: boolean;
  isTextAlignJustify: boolean;
};

type TextAlignEditorInstance = {
  setTextAlign: (payload: 'left' | 'right' | 'center' | 'justify') => void;
  unSetTextAlign: () => void;
};

declare module '../types/EditorBridge' {
  interface BridgeState extends TextAlignEditorState {}
  interface EditorBridge extends TextAlignEditorInstance {}
}

export enum TextAlignEditorActionType {
  SetTextAlign = 'toggle-TextAlign',
  UnSetTextAlign = 'toggle-UnSetTextAlign',
}

type TextAlignMessage = {
  type: TextAlignEditorActionType;
  payload?: 'left' | 'right' | 'center' | 'justify';
};

export const TextAlignBridge = new BridgeExtension<
  TextAlignEditorState,
  TextAlignEditorInstance,
  TextAlignMessage
>({
  tiptapExtension: TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),

  onBridgeMessage: (editor, message) => {
    if (message.type === TextAlignEditorActionType.SetTextAlign) {
      editor
        .chain()
        .focus()
        .setTextAlign(message.payload ?? '')
        .run();
      return false;
    }
    if (message.type === TextAlignEditorActionType.UnSetTextAlign) {
      editor.chain().focus().unsetTextAlign().run();
      return false;
    }
    return false;
  },
  extendEditorInstance: (sendBridgeMessage) => {
    return {
      setTextAlign: (payload) =>
        sendBridgeMessage({
          type: TextAlignEditorActionType.SetTextAlign,
          payload: payload,
        }),
      unSetTextAlign: () =>
        sendBridgeMessage({
          type: TextAlignEditorActionType.UnSetTextAlign,
        }),
    };
  },
  extendEditorState: (editor) => {
    return {
      isTextAlignLeft: editor.isActive({ textAlign: 'left' }),
      isTextAlignRight: editor.isActive({ textAlign: 'right' }),
      isTextAlignCenter: editor.isActive({ textAlign: 'center' }),
      isTextAlignJustify: editor.isActive({ textAlign: 'justify' }),
    };
  },
});
