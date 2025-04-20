package expo.modules.exponfc

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.nfc.NfcManager
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.nfc.tech.NdefFormatable
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.annotation.RequiresApi
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.IOException
import java.nio.charset.Charset

class ExpoNfcModule : Module() {
  private val TAG = "ExpoNfcModule"
  private var nfcAdapter: NfcAdapter? = null
  private var pendingIntent: android.app.PendingIntent? = null
  private var intentFilters: Array<IntentFilter>? = null
  private var techLists: Array<Array<String>>? = null
  private var isScanning = false
  private var urlToWrite: String? = null
  private var isWriteMode = false

  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module
    Name("DigistoneNfcModule") // Keep the original name for JS compatibility

    // Defines event names that the module can send to JavaScript
    Events("onNfcTagDiscovered", "onNfcTagWritten", "onNfcError")

    // Initializes the module
    OnCreate {
      val nfcManager = appContext.reactContext?.getSystemService(Context.NFC_SERVICE) as? NfcManager
      nfcAdapter = nfcManager?.defaultAdapter

      // Create a PendingIntent for NFC intent dispatching
      val intent = Intent(appContext.reactContext, appContext.reactContext?.javaClass)
      intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)

      pendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        android.app.PendingIntent.getActivity(
          appContext.reactContext,
          0,
          intent,
          android.app.PendingIntent.FLAG_MUTABLE
        )
      } else {
        android.app.PendingIntent.getActivity(
          appContext.reactContext,
          0,
          intent,
          0
        )
      }

      // Set up intent filters for NFC discovery
      val ndefIntentFilter = IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED)
      try {
        ndefIntentFilter.addDataType("*/*")
      } catch (e: IntentFilter.MalformedMimeTypeException) {
        Log.e(TAG, "Failed to add MIME type to intent filter", e)
      }

      val techIntentFilter = IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED)
      val tagIntentFilter = IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED)

      intentFilters = arrayOf(ndefIntentFilter, techIntentFilter, tagIntentFilter)
      techLists = arrayOf(
        arrayOf(Ndef::class.java.name),
        arrayOf(NdefFormatable::class.java.name)
      )
    }

    // Handle activity results (for NFC intents)
    OnActivityResult { activity, requestCode, resultCode, data ->
      if (data != null && NfcAdapter.ACTION_NDEF_DISCOVERED == data.action ||
        NfcAdapter.ACTION_TECH_DISCOVERED == data.action ||
        NfcAdapter.ACTION_TAG_DISCOVERED == data.action
      ) {
        val tag = data.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
        if (tag != null) {
          if (isWriteMode && urlToWrite != null) {
            // Write mode - write URL to tag
            writeUrlToNfcTag(tag, urlToWrite!!)
          } else {
            // Read mode - read tag data
            readNfcTag(tag)
          }
        }
      }
      return@OnActivityResult null
    }

    // Check if NFC is available on the device
    AsyncFunction("isNfcAvailable") {
      return@AsyncFunction nfcAdapter != null && nfcAdapter?.isEnabled == true
    }

    // Start scanning for NFC tags
    AsyncFunction("startNfcScan") {
      if (nfcAdapter == null) {
        sendEvent("onNfcError", mapOf(
          "code" to "nfc_unavailable",
          "message" to "NFC is not available on this device"
        ))
        return@AsyncFunction null
      }

      if (nfcAdapter?.isEnabled != true) {
        sendEvent("onNfcError", mapOf(
          "code" to "nfc_disabled",
          "message" to "NFC is disabled in device settings"
        ))
        return@AsyncFunction null
      }

      val activity = appContext.activityProvider?.currentActivity
      if (activity == null) {
        sendEvent("onNfcError", mapOf(
          "code" to "no_activity",
          "message" to "No activity available to handle NFC"
        ))
        return@AsyncFunction null
      }

      // Enable foreground dispatch to handle NFC intents
      try {
        nfcAdapter?.enableForegroundDispatch(
          activity,
          pendingIntent,
          intentFilters,
          techLists
        )
        isScanning = true
        isWriteMode = false
      } catch (e: Exception) {
        sendEvent("onNfcError", mapOf(
          "code" to "scan_failed",
          "message" to "Failed to start NFC scan: ${e.message}"
        ))
      }
      return@AsyncFunction null
    }

    // Stop scanning for NFC tags
    AsyncFunction("stopNfcScan") {
      val activity = appContext.activityProvider?.currentActivity
      if (activity != null && nfcAdapter != null) {
        try {
          nfcAdapter?.disableForegroundDispatch(activity)
          isScanning = false
        } catch (e: Exception) {
          Log.e(TAG, "Error stopping NFC scan", e)
        }
      }
      return@AsyncFunction null
    }

    // Write a URL to an NFC tag
    AsyncFunction("writeUrlToTag") { url: String ->
      if (nfcAdapter == null) {
        sendEvent("onNfcError", mapOf(
          "code" to "nfc_unavailable",
          "message" to "NFC is not available on this device"
        ))
        return@AsyncFunction null
      }

      if (nfcAdapter?.isEnabled != true) {
        sendEvent("onNfcError", mapOf(
          "code" to "nfc_disabled",
          "message" to "NFC is disabled in device settings"
        ))
        return@AsyncFunction null
      }

      val activity = appContext.activityProvider?.currentActivity
      if (activity == null) {
        sendEvent("onNfcError", mapOf(
          "code" to "no_activity",
          "message" to "No activity available to handle NFC"
        ))
        return@AsyncFunction null
      }

      // Set up for writing
      urlToWrite = url
      isWriteMode = true

      // Enable foreground dispatch to handle NFC intents
      try {
        nfcAdapter?.enableForegroundDispatch(
          activity,
          pendingIntent,
          intentFilters,
          techLists
        )
      } catch (e: Exception) {
        sendEvent("onNfcError", mapOf(
          "code" to "write_setup_failed",
          "message" to "Failed to set up NFC write mode: ${e.message}"
        ))
      }
      return@AsyncFunction null
    }

    // Cancel writing to an NFC tag
    AsyncFunction("cancelWriteToTag") {
      val activity = appContext.activityProvider?.currentActivity
      if (activity != null && nfcAdapter != null) {
        try {
          nfcAdapter?.disableForegroundDispatch(activity)
          urlToWrite = null
          isWriteMode = false
        } catch (e: Exception) {
          Log.e(TAG, "Error canceling NFC write", e)
        }
      }
      return@AsyncFunction null
    }
  }

  // Read data from an NFC tag
  private fun readNfcTag(tag: Tag) {
    val ndef = Ndef.get(tag)
    if (ndef != null) {
      try {
        ndef.connect()
        val ndefMessage = ndef.ndefMessage
        if (ndefMessage != null) {
          val records = ndefMessage.records
          if (records.isNotEmpty()) {
            val record = records[0]
            val payload = record.payload
            val data = String(payload, Charset.forName("UTF-8"))
            
            // Create a unique ID from the tag
            val tagId = bytesToHexString(tag.id)
            
            // Get tech types
            val techList = tag.techList.toList()
            
            // Send event with tag data
            sendEvent("onNfcTagDiscovered", mapOf(
              "id" to tagId,
              "techTypes" to techList,
              "data" to data
            ))
          }
        }
        ndef.close()
      } catch (e: Exception) {
        sendEvent("onNfcError", mapOf(
          "code" to "read_error",
          "message" to "Error reading NFC tag: ${e.message}"
        ))
      }
    } else {
      // Try to read as NdefFormatable
      val ndefFormatable = NdefFormatable.get(tag)
      if (ndefFormatable != null) {
        sendEvent("onNfcTagDiscovered", mapOf(
          "id" to bytesToHexString(tag.id),
          "techTypes" to tag.techList.toList(),
          "data" to ""
        ))
      } else {
        sendEvent("onNfcError", mapOf(
          "code" to "unsupported_tag",
          "message" to "Unsupported NFC tag type"
        ))
      }
    }
  }

  // Write a URL to an NFC tag
  private fun writeUrlToNfcTag(tag: Tag, url: String) {
    try {
      val ndef = Ndef.get(tag)
      if (ndef != null) {
        try {
          ndef.connect()
          
          // Create URI record
          val uriRecord = createUriRecord(url)
          val ndefMessage = NdefMessage(arrayOf(uriRecord))
          
          // Write to tag
          ndef.writeNdefMessage(ndefMessage)
          
          // Send success event
          sendEvent("onNfcTagWritten", mapOf(
            "id" to bytesToHexString(tag.id),
            "url" to url
          ))
          
          ndef.close()
        } catch (e: IOException) {
          sendEvent("onNfcError", mapOf(
            "code" to "write_error",
            "message" to "Error writing to NFC tag: ${e.message}"
          ))
        }
      } else {
        // Try to format and write to an unformatted tag
        val ndefFormatable = NdefFormatable.get(tag)
        if (ndefFormatable != null) {
          try {
            ndefFormatable.connect()
            
            // Create URI record
            val uriRecord = createUriRecord(url)
            val ndefMessage = NdefMessage(arrayOf(uriRecord))
            
            // Format and write to tag
            ndefFormatable.format(ndefMessage)
            
            // Send success event
            sendEvent("onNfcTagWritten", mapOf(
              "id" to bytesToHexString(tag.id),
              "url" to url
            ))
            
            ndefFormatable.close()
          } catch (e: IOException) {
            sendEvent("onNfcError", mapOf(
              "code" to "format_error",
              "message" to "Error formatting NFC tag: ${e.message}"
            ))
          }
        } else {
          sendEvent("onNfcError", mapOf(
            "code" to "unsupported_tag",
            "message" to "Unsupported NFC tag type for writing"
          ))
        }
      }
    } finally {
      // Reset write mode
      urlToWrite = null
      isWriteMode = false
    }
  }

  // Create a URI record for an NFC tag
  private fun createUriRecord(uri: String): NdefRecord {
    val uriBytes = uri.toByteArray(Charset.forName("UTF-8"))
    val prefix = byteArrayOf(0) // No prefix byte for complete URLs
    val payload = ByteArray(prefix.size + uriBytes.size)
    
    System.arraycopy(prefix, 0, payload, 0, prefix.size)
    System.arraycopy(uriBytes, 0, payload, prefix.size, uriBytes.size)
    
    return NdefRecord(NdefRecord.TNF_WELL_KNOWN, NdefRecord.RTD_URI, ByteArray(0), payload)
  }

  // Convert byte array to hex string
  private fun bytesToHexString(bytes: ByteArray): String {
    val sb = StringBuilder()
    for (b in bytes) {
      val hex = Integer.toHexString(0xFF and b.toInt())
      if (hex.length == 1) {
        sb.append('0')
      }
      sb.append(hex)
    }
    return sb.toString()
  }
}
