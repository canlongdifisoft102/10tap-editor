import Youtube from '@tiptap/extension-youtube';

import BridgeExtension from './base';

type YoutubeEditorState = {};

type YoutubeEditorInstance = {
  insertYoutube: (opt: { src: string; width: number; height: number }) => void;
};

declare module '../types/EditorBridge' {
  interface BridgeState extends YoutubeEditorState {}
  interface EditorBridge extends YoutubeEditorInstance {}
}

export enum YoutubeEditorActionType {
  InsertYouTube = 'insert-Youtube',
}

type YoutubeMessage = {
  type: YoutubeEditorActionType;
  payload: { src: string; width: number; height: number };
};

export const YoutubeBridge = new BridgeExtension<
  YoutubeEditorState,
  YoutubeEditorInstance,
  YoutubeMessage
>({
  tiptapExtension: Youtube,
  onBridgeMessage: (editor, message) => {
    if (message.type === YoutubeEditorActionType.InsertYouTube) {
      editor.chain().focus().setYoutubeVideo(message.payload).run();
      return false;
    }

    return false;
  },
  extendEditorInstance: (sendBridgeMessage) => {
    return {
      insertYoutube: (payload) =>
        sendBridgeMessage({
          type: YoutubeEditorActionType.InsertYouTube,
          payload: payload,
        }),
    };
  },
});
