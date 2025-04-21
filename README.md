# Expo NFC Module

A cross-platform NFC module for Expo and React Native that enables reading and writing URL links to NFC tags on both iOS and Android devices.

## Features

- Check NFC availability on the device
- Read NFC tags and extract data
- Write URL links to NFC tags
- Handle both NDEF formatted and unformatted tags
- Comprehensive event system for tag discovery, writing success, and error handling
- Full TypeScript support

## Installation

### Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects:

```bash
npx expo install expo-nfc-module
```

### Installation in bare React Native projects

For bare React Native projects, ensure you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

```bash
npm install expo-nfc-module
```

### Required Configuration

This module requires specific configurations for both iOS and Android platforms. Please follow these steps carefully:

#### Configure for Android

Add the following permissions to your `AndroidManifest.xml` file:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

> **Note**: Setting `android:required="false"` allows your app to be installed on devices without NFC hardware, but you should check for NFC availability in your app using `isNfcAvailable()` before attempting to use NFC features.

#### Configure for iOS

Follow these steps to configure your iOS project:

1. Run `npx pod-install` after installing the npm package

2. Add the following to your `Info.plist` file:

   ```xml
   <key>NFCReaderUsageDescription</key>
   <string>This app needs access to NFC to read and write NFC tags</string>
   <key>com.apple.developer.nfc.readersession.formats</key>
   <array>
     <string>NDEF</string>
     <string>TAG</string>
   </array>
   ```

3. Enable the Near Field Communication Tag Reading capability in your Xcode project

4. Ensure your Apple Developer account has NFC entitlements enabled for your app

## API Reference

### Checking NFC Availability

```typescript
import * as ExpoNfcModule from 'expo-nfc-module';

// Check if NFC is available on the device
const isAvailable = await ExpoNfcModule.isNfcAvailable();
console.log(`NFC available: ${isAvailable}`);
```

### Reading NFC Tags

```typescript
import * as ExpoNfcModule from 'expo-nfc-module';

// Start scanning for NFC tags
await ExpoNfcModule.startNfcScan();

// Add a listener for when an NFC tag is discovered
const subscription = ExpoNfcModule.addNfcTagDiscoveredListener((event) => {
  console.log('Tag discovered:', event.id);
  console.log('Tech types:', event.techTypes);
  console.log('Data:', event.data);
});

// Stop scanning for NFC tags when done
await ExpoNfcModule.stopNfcScan();

// Remove the listener when no longer needed
subscription.remove();
```

### Writing URLs to NFC Tags

```typescript
import * as ExpoNfcModule from 'expo-nfc-module';

// Add a listener for when a URL is successfully written to an NFC tag
const writeSubscription = ExpoNfcModule.addNfcTagWrittenListener((event) => {
  console.log(`Successfully wrote URL ${event.url} to tag ${event.id}`);
});

// Write a URL to an NFC tag
await ExpoNfcModule.writeUrlToTag('https://example.com');

// Cancel writing to a tag if needed
await ExpoNfcModule.cancelWriteToTag();

// Remove the listener when no longer needed
writeSubscription.remove();
```

### Error Handling

```typescript
import * as ExpoNfcModule from 'expo-nfc-module';

// Add a listener for NFC errors
const errorSubscription = ExpoNfcModule.addNfcErrorListener((error) => {
  console.error(`NFC Error: ${error.code} - ${error.message}`);
});

// Remove the listener when no longer needed
errorSubscription.remove();
```

## Event Types

### NfcTagDiscoveredEventPayload

```typescript
type NfcTagDiscoveredEventPayload = {
  id: string;        // Unique identifier for the NFC tag
  techTypes: string[]; // Array of technology types supported by the tag
  data?: string;     // Optional data content of the tag
};
```

### NfcTagWrittenEventPayload

```typescript
type NfcTagWrittenEventPayload = {
  id: string;  // Unique identifier for the NFC tag
  url: string; // The URL that was written to the tag
};
```

### NfcErrorEventPayload

```typescript
type NfcErrorEventPayload = {
  code: string;    // Error code
  message: string; // Error message
};
```

## Important Requirements and Limitations

### Development Environment

- **Development/Production Builds Only**: NFC functionality requires a development or production build and **will not work in Expo Go**
- **Physical Devices Only**: NFC only works on physical devices with NFC capabilities (not simulators/emulators)
- For Expo projects, you must create a development or production build using EAS Build or the local build process

### iOS Requirements

- iPhone 7 or newer running iOS 13+
- The app must be in the foreground to use NFC
- iOS will show a system dialog for NFC operations
- Requires an Apple Developer account with NFC entitlements
- Apple requires a privacy usage description in Info.plist

### Android Requirements

- Device must have NFC hardware
- NFC must be enabled in the device settings
- For optimal user experience, instruct users to hold the tag against the back of their device
- Some Android devices may require specific positioning of the NFC tag

## Example Usage

A complete example application is available in the `example` directory of this repository.

### Basic Implementation

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import * as ExpoNfcModule from 'expo-nfc-module';

export default function NfcScreen() {
  const [isNfcAvailable, setIsNfcAvailable] = useState(false);
  const [tagData, setTagData] = useState(null);
  
  useEffect(() => {
    // Check if NFC is available on the device
    checkNfcAvailability();
    
    // Set up NFC tag discovered listener
    const subscription = ExpoNfcModule.addNfcTagDiscoveredListener((event) => {
      setTagData(event);
    });
    
    // Clean up listener when component unmounts
    return () => {
      subscription.remove();
    };
  }, []);
  
  const checkNfcAvailability = async () => {
    const available = await ExpoNfcModule.isNfcAvailable();
    setIsNfcAvailable(available);
  };
  
  const startScanning = async () => {
    try {
      await ExpoNfcModule.startNfcScan();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  const stopScanning = async () => {
    try {
      await ExpoNfcModule.stopNfcScan();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  const writeUrl = async () => {
    try {
      await ExpoNfcModule.writeUrlToTag('https://example.com');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ marginBottom: 20 }}>
        NFC Available: {isNfcAvailable ? 'Yes' : 'No'}
      </Text>
      
      {tagData && (
        <View style={{ marginBottom: 20 }}>
          <Text>Tag ID: {tagData.id}</Text>
          <Text>Data: {tagData.data || 'No data'}</Text>
        </View>
      )}
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
        <Button title="Start Scan" onPress={startScanning} disabled={!isNfcAvailable} />
        <Button title="Stop Scan" onPress={stopScanning} disabled={!isNfcAvailable} />
        <Button title="Write URL" onPress={writeUrl} disabled={!isNfcAvailable} />
      </View>
    </View>
  );
}
```

## Troubleshooting

### Common Issues

- **"NFC not available"**: Ensure the device has NFC hardware and it's enabled in settings
- **iOS NFC not working**: Verify you have the proper entitlements in your Apple Developer account
- **Android NFC not detecting tags**: Make sure NFC is enabled in device settings and try different positions
- **Expo Go not working**: Remember that NFC requires a development or production build

## Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide](https://github.com/expo/expo#contributing).
