export { default as BridgeExtension } from '../bridges/base';
export { BlockquoteBridge } from '../bridges/blockquote';
export { BoldBridge } from '../bridges/bold';
export { HardBreakBridge } from '../bridges/br';
export { BulletListBridge } from '../bridges/bulletList';
export { CodeBridge } from '../bridges/code';
export { ColorBridge } from '../bridges/color';
export { CoreBridge } from '../bridges/core';
export { HeadingBridge } from '../bridges/heading';
export { HighlightBridge } from '../bridges/highlight';
export { blueBackgroundPlugin } from '../bridges/HighlightSelection';
export { HistoryBridge } from '../bridges/history';
export { ImageBridge } from '../bridges/image';
export { ItalicBridge } from '../bridges/italic';
export { LinkBridge } from '../bridges/link';
export { ListItemBridge } from '../bridges/listItem';
export { OrderedListBridge } from '../bridges/orderedList';
export { PlaceholderBridge } from '../bridges/placeholder';
export { TenTapStartKit } from '../bridges/StarterKit';
export { StrikeBridge } from '../bridges/strike';
export { TaskListBridge } from '../bridges/tasklist';
export { TextAlignBridge } from '../bridges/textAlign';
export { UnderlineBridge } from '../bridges/underline';
export { YoutubeBridge } from '../bridges/youTube';
export * from './useTenTap';

// We are exposing tiptap view + state here to avoid this error https://github.com/ueberdosis/tiptap/issues/3869#issuecomment-2167931620
export * from '@tiptap/pm/state';
export * from '@tiptap/pm/view';
