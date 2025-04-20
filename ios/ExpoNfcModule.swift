import ExpoModulesCore
import CoreNFC

// Separate delegate class that inherits from NSObject
@available(iOS 13.0, *)
class NFCDelegate: NSObject, NFCNDEFReaderSessionDelegate {
  weak var module: ExpoNfcModule?
  
  init(module: ExpoNfcModule) {
    self.module = module
    super.init()
  }
  
  // MARK: - NFCNDEFReaderSessionDelegate Methods
  
  public func readerSession(_ session: NFCNDEFReaderSession, didInvalidateWithError error: Error) {
    module?.handleSessionInvalidation(session: session, error: error)
  }
  
  public func readerSession(_ session: NFCNDEFReaderSession, didDetectNDEFs messages: [NFCNDEFMessage]) {
    module?.handleDetectedNDEFMessages(session: session, messages: messages)
  }
  
  public func readerSessionDidBecomeActive(_ session: NFCNDEFReaderSession) {
    // Optional delegate method, can be implemented if needed
  }
  
  public func readerSession(_ session: NFCNDEFReaderSession, didDetect tags: [NFCNDEFTag]) {
    module?.handleDetectedTags(session: session, tags: tags)
  }
}

@available(iOS 13.0, *)
public class ExpoNfcModule: Module {
  private var nfcSession: NFCNDEFReaderSession?
  private var writeSession: NFCNDEFReaderSession?
  private var urlToWrite: URL?
  private lazy var nfcDelegate = NFCDelegate(module: self)
  
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // NOTE: This will be accessible in JavaScript as expo-modules-core.NativeModulesProxy.ExpoNfcModule
    Name("ExpoNfcModule")
    
    // Defines event names that the module can send to JavaScript.
    Events("onNfcTagDiscovered", "onNfcTagWritten", "onNfcError")
    
    // Defines methods that JavaScript can call.
    Function("isNfcAvailable") { () -> Bool in
      if #available(iOS 13.0, *) {
        return NFCNDEFReaderSession.readingAvailable
      } else {
        return false
      }
    }
    
    AsyncFunction("startNfcScan") { () -> Void in
      if #available(iOS 13.0, *) {
        if NFCNDEFReaderSession.readingAvailable {
          // Create and configure NFC session
          self.nfcSession = NFCNDEFReaderSession(delegate: self.nfcDelegate, queue: nil, invalidateAfterFirstRead: false)
          self.nfcSession?.alertMessage = "Hold your iPhone near an NFC tag"
          self.nfcSession?.begin()
        } else {
          // NFC not available on this device
          self.sendEvent("onNfcError", [
            "code": "nfc_unavailable",
            "message": "NFC is not available on this device"
          ])
        }
      } else {
        // iOS version too low
        self.sendEvent("onNfcError", [
          "code": "ios_version",
          "message": "NFC requires iOS 13 or later"
        ])
      }
    }
    
    AsyncFunction("stopNfcScan") { () -> Void in
      if #available(iOS 13.0, *) {
        self.nfcSession?.invalidate()
        self.nfcSession = nil
      }
    }
    
    AsyncFunction("writeUrlToTag") { (url: String) -> Void in
      if #available(iOS 13.0, *) {
        guard let url = URL(string: url) else {
          self.sendEvent("onNfcError", [
            "code": "invalid_url",
            "message": "Invalid URL format"
          ])
          return
        }
        
        self.urlToWrite = url
        
        if NFCNDEFReaderSession.readingAvailable {
          // Create and configure NFC session for writing
          self.writeSession = NFCNDEFReaderSession(delegate: self.nfcDelegate, queue: nil, invalidateAfterFirstRead: false)
          self.writeSession?.alertMessage = "Hold your iPhone near an NFC tag to write the URL"
          self.writeSession?.begin()
        } else {
          // NFC not available on this device
          self.sendEvent("onNfcError", [
            "code": "nfc_unavailable",
            "message": "NFC is not available on this device"
          ])
        }
      } else {
        // iOS version too low
        self.sendEvent("onNfcError", [
          "code": "ios_version",
          "message": "NFC requires iOS 13 or later"
        ])
      }
    }
    
    AsyncFunction("cancelWriteToTag") { () -> Void in
      if #available(iOS 13.0, *) {
        self.writeSession?.invalidate()
        self.writeSession = nil
        self.urlToWrite = nil
      }
    }
  }
  
  // MARK: - NFC Session Handling
  
  @available(iOS 13.0, *)
  func handleSessionInvalidation(session: NFCNDEFReaderSession, error: Error) {
    // Check if this is a canceled session
    if let nfcError = error as? NFCReaderError, nfcError.code == .readerSessionInvalidationErrorUserCanceled {
      // User canceled the session, no need to show an error
      return
    }
    
    // Send error event for other error types
    sendEvent("onNfcError", [
      "code": "session_invalidated",
      "message": error.localizedDescription
    ])
  }
  
  @available(iOS 13.0, *)
  func handleDetectedNDEFMessages(session: NFCNDEFReaderSession, messages: [NFCNDEFMessage]) {
    guard let message = messages.first, let record = message.records.first else {
      return
    }
    
    // Extract tag data
    let tagId = message.records.first?.identifier.map { String(format: "%02hhx", $0) }.joined() ?? "unknown"
    let payload = String(data: record.payload, encoding: .utf8) ?? ""
    
    // Send event with tag data
    sendEvent("onNfcTagDiscovered", [
      "id": tagId,
      "techTypes": ["NDEF"],
      "data": payload
    ])
  }
  
  @available(iOS 13.0, *)
  func handleDetectedTags(session: NFCNDEFReaderSession, tags: [NFCNDEFTag]) {
    // Handle detected tags
    guard let tag = tags.first else {
      session.invalidate(errorMessage: "No tag found")
      return
    }
    
    // Connect to tag
    session.connect(to: tag) { error in
      if let error = error {
        session.invalidate(errorMessage: "Connection failed: \(error.localizedDescription)")
        return
      }
      
      // Check if we're in write mode
      if let urlToWrite = self.urlToWrite, session == self.writeSession {
        // We're in write mode, prepare to write URL to tag
        tag.queryNDEFStatus { status, capacity, error in
          if let error = error {
            session.invalidate(errorMessage: "Failed to query tag: \(error.localizedDescription)")
            return
          }
          
          // Create URL record
          let urlRecord = NFCNDEFPayload.wellKnownTypeURIPayload(url: urlToWrite)!
          let message = NFCNDEFMessage(records: [urlRecord])
          
          // Write message to tag
          tag.writeNDEF(message) { error in
            if let error = error {
              session.invalidate(errorMessage: "Write failed: \(error.localizedDescription)")
              self.sendEvent("onNfcError", [
                "code": "write_failed",
                "message": error.localizedDescription
              ])
            } else {
              // Write successful
              let tagId = urlRecord.identifier.map { String(format: "%02hhx", $0) }.joined() ?? "unknown"
              session.alertMessage = "URL successfully written to tag!"
              session.invalidate()
              
              // Send success event
              self.sendEvent("onNfcTagWritten", [
                "id": tagId,
                "url": urlToWrite.absoluteString
              ])
            }
          }
        }
      } else {
        // We're in read mode, query tag for NDEF data
        tag.queryNDEFStatus { status, capacity, error in
          if let error = error {
            session.invalidate(errorMessage: "Failed to query tag: \(error.localizedDescription)")
            return
          }
          
          // Read NDEF message from tag
          tag.readNDEF { message, error in
            if let error = error {
              session.invalidate(errorMessage: "Read failed: \(error.localizedDescription)")
              return
            }
            
            guard let message = message, let record = message.records.first else {
              session.invalidate(errorMessage: "No NDEF message found on tag")
              return
            }
            
            // Extract tag data
            let tagId = record.identifier.map { String(format: "%02hhx", $0) }.joined() ?? "unknown"
            let payload = String(data: record.payload, encoding: .utf8) ?? ""
            
            // Send event with tag data
            self.sendEvent("onNfcTagDiscovered", [
              "id": tagId,
              "techTypes": ["NDEF"],
              "data": payload
            ])
            
            session.alertMessage = "Tag read successfully!"
            session.invalidate()
          }
        }
      }
    }
  }
}
