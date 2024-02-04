import React, { useEffect } from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';
import {
  WebView,
  type WebViewProps,
  type WebViewMessageEvent,
} from 'react-native-webview';

// @ts-ignore
import editorHTML from '../simpleWebEditor/build/index.html';

import { type EditorMessage, EditorMessageType } from '../types/Messaging';
import { useKeyboard } from '../utils';
import type { EditorInstance } from '../types';

interface RichTextProps extends WebViewProps {
  editor: EditorInstance;
  avoidIosKeyboard?: boolean;
  autofocus?: boolean;
  customSource?: string;
  DEV?: boolean;
}

const styles = StyleSheet.create({
  hiddenInput: {
    display: 'none',
    width: 0,
    height: 0,
    position: 'absolute',
    flex: 1,
    top: 0,
    left: 0,
  },
});

const DEV_SERVER_URL = 'http://localhost:3000';

export const RichText = ({
  DEV,
  editor,
  customSource,
  avoidIosKeyboard,
  autofocus,
}: RichTextProps) => {
  const { keyboardHeight: iosKeyboardHeight } = useKeyboard();
  const source: WebViewProps['source'] = DEV
    ? { uri: DEV_SERVER_URL }
    : { html: customSource || editorHTML };

  const onWebviewMessage = (event: WebViewMessageEvent) => {
    const { data } = event.nativeEvent;
    // Parse the message sent from the editor
    const { type, payload } = JSON.parse(data) as EditorMessage;
    editor.plugins?.forEach((e) => {
      e.onEditorMessage && e.onEditorMessage({ type, payload });
    });
    switch (type) {
      case EditorMessageType.EditorReady:
        if (autofocus) {
          console.log('focus');
          editor.focus('end');
        }
        break;
      case EditorMessageType.StateUpdate:
        editor._updateEditorState(payload);
        break;
    }
  };

  useEffect(() => {
    // On iOS we want to control the scroll and not use the scrollview that comes with react-native-webview
    // That's way we can get better exp on scroll and scroll to element when we need to
    if (avoidIosKeyboard && editor.webviewRef.current) {
      if (iosKeyboardHeight) {
        editor.webviewRef.current.injectJavaScript(`
          document.querySelector('.ProseMirror').style.paddingBottom = '${
            iosKeyboardHeight + 10
          }px';
        `);
        editor.updateScrollThresholdAndMargin(iosKeyboardHeight + 10);
      } else {
        editor.webviewRef.current.injectJavaScript(`
          document.querySelector('.ProseMirror').style.paddingBottom = '0px';
        `);
        editor.updateScrollThresholdAndMargin(0);
      }
    }
  }, [avoidIosKeyboard, editor, iosKeyboardHeight]);

  return (
    <>
      {autofocus && Platform.OS === 'android' && (
        <TextInput autoFocus style={styles.hiddenInput} />
      )}
      <WebView
        scrollEnabled={false}
        style={RichTextStyles.fullScreen}
        source={source}
        injectedJavaScript={
          editor.plugins
            ? `
                var css = \`${editor.plugins
                  .map((e) => e.extendCSS)
                  .join(' ')}\`,
                head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');
        
                head.appendChild(style);
        
                style.type = 'text/css';
                if (style.styleSheet){
                  // This is required for IE8 and below.
                  style.styleSheet.cssText = css;
                } else {
                  style.appendChild(document.createTextNode(css));
                }
              `
            : undefined
        }
        injectedJavaScriptBeforeContentLoaded={`${
          editor.plugins
            ? `

            window.plugConfig = '${JSON.stringify(
              editor.plugins.reduce((acc, bridge) => {
                return {
                  ...acc,
                  [bridge.name]: bridge.config,
                };
              }, {})
            )}';

            window.whiteListPlugins = [${editor.plugins
              .map((plugin) => `'${plugin.name}'`)
              .join(',')}];
                `
            : ''
        }${
          editor.initialContent
            ? `window.initialContent = '${editor.initialContent}';`
            : ''
        }`}
        hideKeyboardAccessoryView={true}
        onMessage={onWebviewMessage}
        ref={editor.webviewRef}
        webviewDebuggingEnabled={__DEV__}
        keyboardDisplayRequiresUserAction={false}
      />
    </>
  );
};

const RichTextStyles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
});