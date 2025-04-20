import * as React from 'react';

import { DigistoneNfcModuleViewProps } from './DigistoneNfcModule.types';

export default function DigistoneNfcModuleView(props: DigistoneNfcModuleViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
