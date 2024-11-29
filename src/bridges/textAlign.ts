import TextAlign from '@tiptap/extension-text-align';

import BridgeExtension from './base';

type TextAlignEditorState = {
  isTextAlignLeft: boolean;
  isTextAlignRight: boolean;
  isTextAlignCenter: boolean;
  isTextAlignJustify: boolean;
};

type TextAlignEditorInstance = {
  toggleTextAlignLeft: () => void;
  toggleTextAlignRight: () => void;
  toggleTextAlignCenter: () => void;
  toggleTextAlignJustify: () => void;
};

declare module '../types/EditorBridge' {
  interface BridgeState extends TextAlignEditorState {}
  interface EditorBridge extends TextAlignEditorInstance {}
}

export enum TextAlignEditorActionType {
  ToggleTextAlignLeft = 'toggle-TextAlignLeft',
  ToggleTextAlignRight = 'toggle-TextAlignRight',
  ToggleTextAlignCenter = 'toggle-TextAlignCenter',
  ToggleTextAlignJustify = 'toggle-TextAlignJustify',
}

type TextAlignMessage = {
  type: TextAlignEditorActionType;
  payload?: undefined;
};

export const TextAlignBridge = new BridgeExtension<
  TextAlignEditorState,
  TextAlignEditorInstance,
  TextAlignMessage
>({
  tiptapExtension: TextAlign,

  onBridgeMessage: (editor, message) => {
    if (
      ![
        TextAlignEditorActionType.ToggleTextAlignLeft,
        TextAlignEditorActionType.ToggleTextAlignRight,
        TextAlignEditorActionType.ToggleTextAlignCenter,
        TextAlignEditorActionType.ToggleTextAlignJustify,
      ].includes(message.type as TextAlignEditorActionType)
    ) {
      return false;
    }
    //'left', 'center', 'right', 'justify'
    let align = 'justify';
    message.type === TextAlignEditorActionType.ToggleTextAlignLeft &&
      (align = 'left');
    message.type === TextAlignEditorActionType.ToggleTextAlignRight &&
      (align = 'right');
    message.type === TextAlignEditorActionType.ToggleTextAlignCenter &&
      (align = 'center');
    message.type === TextAlignEditorActionType.ToggleTextAlignJustify &&
      (align = 'justify');
    editor.chain().focus().setTextAlign(align).run();
    return false;
  },
  extendEditorInstance: (sendBridgeMessage) => {
    return {
      toggleTextAlignLeft: () =>
        sendBridgeMessage({
          type: TextAlignEditorActionType.ToggleTextAlignLeft,
        }),
      toggleTextAlignRight: () =>
        sendBridgeMessage({
          type: TextAlignEditorActionType.ToggleTextAlignRight,
        }),
      toggleTextAlignCenter: () =>
        sendBridgeMessage({
          type: TextAlignEditorActionType.ToggleTextAlignCenter,
        }),
      toggleTextAlignJustify: () =>
        sendBridgeMessage({
          type: TextAlignEditorActionType.ToggleTextAlignJustify,
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
