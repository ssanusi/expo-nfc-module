import { registerWebModule, NativeModule } from 'expo';

import { DigistoneNfcModuleEvents } from './DigistoneNfcModule.types';

class DigistoneNfcModule extends NativeModule<DigistoneNfcModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(DigistoneNfcModule);
