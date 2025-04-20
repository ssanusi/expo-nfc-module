import * as React from 'react';

import type { ExpoNfcModuleViewProps } from './ExpoNfcModule.types';

export default function ExpoNfcModuleView(props: Readonly<ExpoNfcModuleViewProps>) {
  return (
    <div>
      <iframe
        className="nfc-content-viewer"
        src={props.url ?? 'about:blank'}
        title="NFC Content Viewer"
        onLoad={() => {
          if (props.onLoad && props.url) {
            props.onLoad({ nativeEvent: { url: props.url } });
          }
        }}
      />
    </div>
  );
}
