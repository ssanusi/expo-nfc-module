const { withInfoPlist, withAndroidManifest, withXcodeProject } = require('@expo/config-plugins');

// iOS: Add NFC entitlements to the project
const withNfcEntitlements = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    
    // Get the project's main target
    const projectName = xcodeProject.getFirstTarget().firstTarget.name;
    
    // Add the Near Field Communication Tag Reading capability
    xcodeProject.addCapability({
      project: projectName,
      capability: 'com.apple.developer.nfc.readersession.formats',
      capabilityType: 'entitlements',
    });
    
    return config;
  });
};

// iOS: Add NFC Info.plist entries
const withNfcInfoPlist = (config) => {
  return withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;
    
    // Add NFC Reader Usage Description if not already present
    if (!infoPlist.NFCReaderUsageDescription) {
      infoPlist.NFCReaderUsageDescription = 'This app needs access to NFC to read and write NFC tags';
    }
    
    // Add NFC reader session formats if not already present
    if (!infoPlist['com.apple.developer.nfc.readersession.formats']) {
      infoPlist['com.apple.developer.nfc.readersession.formats'] = ['NDEF', 'TAG'];
    }
    
    return config;
  });
};

// Android: Add NFC permissions and features to AndroidManifest.xml
const withNfcAndroidManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Add uses-permission for NFC
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }
    
    // Check if NFC permission already exists
    const hasNfcPermission = androidManifest.manifest['uses-permission'].some(
      (permission) => permission.$?.['android:name'] === 'android.permission.NFC'
    );
    
    if (!hasNfcPermission) {
      androidManifest.manifest['uses-permission'].push({
        $: {
          'android:name': 'android.permission.NFC',
        },
      });
    }
    
    // Add uses-feature for NFC
    if (!androidManifest.manifest['uses-feature']) {
      androidManifest.manifest['uses-feature'] = [];
    }
    
    // Check if NFC feature already exists
    const hasNfcFeature = androidManifest.manifest['uses-feature'].some(
      (feature) => feature.$?.['android:name'] === 'android.hardware.nfc'
    );
    
    if (!hasNfcFeature) {
      androidManifest.manifest['uses-feature'].push({
        $: {
          'android:name': 'android.hardware.nfc',
          'android:required': 'false', // Set to false to make it optional
        },
      });
    }
    
    return config;
  });
};

// Main plugin function that applies all modifications
const withExpoNfc = (config) => {
  let modifiedConfig = withNfcInfoPlist(config);
  modifiedConfig = withNfcEntitlements(modifiedConfig);
  modifiedConfig = withNfcAndroidManifest(modifiedConfig);
  return modifiedConfig;
};

module.exports = withExpoNfc;
