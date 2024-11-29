import { BlockquoteBridge } from './blockquote';
import { BoldBridge } from './bold';
import { HardBreakBridge } from './br';
import { BulletListBridge } from './bulletList';
import { CodeBridge } from './code';
import { ColorBridge } from './color';
import { CoreBridge } from './core';
import { DropCursorBridge } from './dropcursor';
import { HeadingBridge } from './heading';
import { HighlightBridge } from './highlight';
import { HistoryBridge } from './history';
import { ImageBridge } from './image';
import { ItalicBridge } from './italic';
import { LinkBridge } from './link';
import { ListItemBridge } from './listItem';
import { OrderedListBridge } from './orderedList';
import { PlaceholderBridge } from './placeholder';
import { StrikeBridge } from './strike';
import { TaskListBridge } from './tasklist';
import { TextAlignBridge } from './textAlign';
import { UnderlineBridge } from './underline';

export const TenTapStartKit = [
  BoldBridge,
  HistoryBridge,
  CodeBridge,
  ItalicBridge,
  StrikeBridge,
  UnderlineBridge,
  OrderedListBridge,
  HeadingBridge,
  ImageBridge,
  BulletListBridge,
  BlockquoteBridge,
  TaskListBridge,
  LinkBridge,
  ColorBridge,
  HighlightBridge,
  CoreBridge,
  PlaceholderBridge,
  ListItemBridge,
  DropCursorBridge,
  HardBreakBridge,
  TextAlignBridge,
  TextAlignBridge,
];
