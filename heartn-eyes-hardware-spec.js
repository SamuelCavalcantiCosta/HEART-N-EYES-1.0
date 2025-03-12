/**
 * HEART'N'EYES Hardware Interface Specification
 * ---------------------------------------------
 * This document outlines the technical specifications and communication protocols
 * for the HEART'N'EYES smart contact lens system.
 */

// BLE Service and Characteristic UUIDs
const LENS_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';

// Video data characteristic - handles sending raw video frames
const LENS_VIDEO_CHARACTERISTIC = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
// Notification: enabled to receive video data
// Properties: notify, read
// Format: Binary chunks of encoded video data (H.264/H.265)

// Control characteristic - handles commands sent to the lens
const LENS_CONTROL_CHARACTERISTIC = '2a56b1fa-c676-4471-95a2-6c3e15a8e063';
// Properties: write, read
// Format: Binary control commands

// Status characteristic - provides lens status updates
const LENS_STATUS_CHARACTERISTIC = '7f118b4c-9d1e-4f63-8cd6-9143f9b4a2e8';
// Notification: enabled to receive status updates
// Properties: notify, read
// Format: JSON status data

// Battery characteristic - provides battery level updates
const LENS_BATTERY_CHARACTERISTIC = '2a19'; // Standard BLE battery service
// Notification: enabled to receive battery updates
// Properties: notify, read
// Format: Single byte with battery percentage (0-100)

// Configuration characteristic - handles lens settings
const LENS_CONFIG_CHARACTERISTIC = 'd8d4c94e-f45b-4b2d-8ffa-02c3e7e04331';
// Properties: write, read
// Format: JSON configuration data

/**
 * Control Commands Format
 * -----------------------
 * Commands are sent as binary data to the LENS_CONTROL_CHARACTERISTIC
 */

// Command structure:
// Byte 0: Command ID
// Byte 1: Command parameter length (n)
// Bytes 2 to 2+n: Command parameters

// Command IDs
const COMMANDS = {
  // Basic lens operation
  POWER_OFF: 0x00,
  POWER_ON: 0x01,
  
  // Recording controls
  START_RECORDING: 0x10,
  STOP_RECORDING: 0x11,
  PAUSE_RECORDING: 0x12,
  RESUME_RECORDING: 0x13,
  
  // Streaming controls
  START_STREAMING: 0x20,
  STOP_STREAMING: 0x21,
  MODIFY_BITRATE: 0x22, // Parameters: 4 bytes (uint32) for bitrate in bps
  
  // Camera controls
  ADJUST_EXPOSURE: 0x30, // Parameters: 1 byte (int8) for EV adjustment
  TOGGLE_HDR: 0x31,      // Parameters: 1 byte (bool) for enable/disable
  ADJUST_FRAMERATE: 0x32, // Parameters: 1 byte for FPS (typically 24, 30, 60)
  
  // Sensor controls
  TOGGLE_IMAGE_STABILIZATION: 0x40, // Parameters: 1 byte (bool) for enable/disable
  TOGGLE_MOTION_DETECTION: 0x41,    // Parameters: 1 byte (bool) for enable/disable
  
  // System commands
  FACTORY_RESET: 0xF0,
  FIRMWARE_UPDATE: 0xF1,
  DIAGNOSTIC_MODE: 0xF2
};

/**
 * Status Updates Format
 * ---------------------
 * Status updates are received from the LENS_STATUS_CHARACTERISTIC
 * as JSON strings with the following format:
 */
const STATUS_UPDATE_EXAMPLE = {
  // Basic device info
  "deviceId": "HNE-12345678",
  "firmwareVersion": "1.2.3",
  
  // Power status
  "batteryLevel": 85, // percentage
  "batteryTimeRemaining": 120, // minutes
  "temperature": 37.2, // Celsius
  
  // Recording/Streaming status
  "isRecording": false,
  "isStreaming": true,
  "recordingDuration": 0, // seconds
  "streamingDuration": 352, // seconds
  
  // Camera status
  "exposure": 0, // EV adjustment
  "hdrEnabled": true,
  "framerate": 30, // FPS
  
  // Sensor status
  "imageStabilizationEnabled": true,
  "motionDetectionEnabled": false,
  
  // Storage status
  "storageAvailable": 1024, // MB
  "storageUsed": 256, // MB
  
  // Network stats (if streaming)
  "streamBitrate": 2500000, // bps
  "packetLoss": 0.02, // percentage
  "latency": 120 // ms
};

/**
 * Configuration Format
 * --------------------
 * Configuration is sent to the LENS_CONFIG_CHARACTERISTIC
 * as JSON strings with the following format:
 */
const CONFIG_EXAMPLE = {
  // Video settings
  "video": {
    "resolution": "1080p", // "720p", "1080p", "1440p"
    "bitrate": 2500000, // bps
    "codec": "h264", // "h264", "h265"
    "profile": "high", // "baseline", "main", "high"
    "framerate": 30, // FPS
    "keyframeInterval": 2, // seconds
  },
  
  // Recording settings
  "recording": {
    "autoStart": false,
    "maxDuration": 3600, // seconds (0 = unlimited)
    "format": "mp4", // "mp4", "mov"
  },
  
  // Streaming settings
  "streaming": {
    "platform": "custom", // "youtube", "twitch", "custom"
    "streamKey": "sk_abcdefghijklmnopqrstuvwxyz",
    "rtmpUrl": "rtmp://stream.heartneyes.example/live",
    "adaptiveBitrate": true,
    "lowLatencyMode": true,
  },
  
  // Camera settings
  "camera": {
    "exposureMode": "auto", // "auto", "manual"
    "exposureCompensation": 0, // EV adjustment
    "hdrEnabled": true,
    "imageStabilization": true,
  },
  
  // Power management
  "power": {
    "standbyTimeout": 300, // seconds
    "lowPowerMode": false,
    "batteryThreshold": 15, // percentage to trigger warning
  },
  
  // Privacy settings
  "privacy": {
    "recordingIndicator": "visible", // "visible", "hidden"
    "beepOnRecording": true,
    "geotagging": false,
    "autoBlurFaces": false,
  },
  
  // Connectivity settings
  "connectivity": {
    "preferredDevice": "54:A3:B9:28:7F:E1", // MAC address
    "reconnectAttempts": 5,
    "pairingTimeout": 60, // seconds
  }
};

/**
 * Video Data Format
 * -----------------
 * Video data is sent through the LENS_VIDEO_CHARACTERISTIC as binary chunks
 * with the following format:
 */

// Video chunk structure:
// Bytes 0-3: Chunk ID (uint32)
// Bytes 4-7: Timestamp (uint32, milliseconds since recording/stream start)
// Bytes 8-11: Chunk duration (uint32, milliseconds)
// Bytes 12-15: Chunk size (uint32, bytes)
// Bytes 16-19: Flags (uint32, bitfield)
//   - Bit 0: Keyframe flag (1 = keyframe, 0 = not keyframe)
//   - Bit 1: End of stream flag (1 = last chunk, 0 = not last chunk)
//   - Bits 2-31: Reserved
// Bytes 20+: Video data payload (H.264/H.265 encoded)

/**
 * Hardware Specifications
 * ----------------------
 * Technical specifications for the HEART'N'EYES contact lens
 */
const HARDWARE_SPECS = {
  // Physical specifications
  "dimensions": {
    "diameter": 14.2, // mm
    "thickness": 0.3,  // mm
    "weight": 0.2      // grams
  },
  
  // Image sensor
  "sensor": {
    "type": "CMOS",
    "resolution": "2.1MP",
    "pixelSize": 1.4,   // micrometers
    "dynamicRange": 70, // dB
    "spectralRange": "400-700nm", // visible light
  },
  
  // Video capabilities
  "video": {
    "maxResolution": "1080p",
    "maxFramerate": 60, // FPS
    "supportedFormats": ["H.264", "H.265"],
    "minBitrate": 500000,  // bps
    "maxBitrate": 5000000, // bps
  },
  
  // Power system
  "power": {
    "batteryCapacity": 10, // mAh
    "operatingTime": 2,    // hours (continuous recording)
    "standbyTime": 12,     // hours
    "chargingMethod": "Wireless induction",
    "chargingTime": 45,    // minutes (0-100%)
  },
  
  // Connectivity
  "connectivity": {
    "primaryProtocol": "Bluetooth LE 5.2",
    "range": 10,         // meters
    "dataRate": 2,       // Mbps
    "latency": 15,       // ms
    "encryption": "AES-256",
  },
  
  // Storage
  "storage": {
    "capacity": 32, // GB
    "type": "Flash",
    "readSpeed": 30, // MB/s
    "writeSpeed": 20, // MB/s
  },
  
  // Processing
  "processor": {
    "type": "Custom SoC",
    "cores": 2,
    "frequency": 800, // MHz
    "architecture": "ARM Cortex-M7",
  },
  
  // Environmental
  "environmental": {
    "operatingTemperature": "0-40°C",
    "waterResistance": "IP67",
    "impactResistance": "MIL-STD-810G",
  }
};

/**
 * Implementation Notes
 * -------------------
 * 
 * Power Management:
 * - Due to the limited battery capacity, power consumption must be carefully managed
 * - The lens enters low-power mode when inactive for the configured standby timeout
 * - Critical operations prioritize battery life over performance
 * 
 * Wireless Communication:
 * - BLE is used for communication with the mobile companion app
 * - To maintain reliable connection, the lens should be within 10 meters of the companion device
 * - The lens will attempt to reconnect automatically if connection is lost
 * 
 * Video Encoding:
 * - H.264 is the default encoding format for compatibility
 * - H.265 is available for higher quality at lower bitrates, but requires more processing power
 * - Adaptive bitrate adjusts quality based on connection quality and battery level
 * 
 * Thermal Management:
 * - Extended recording or streaming can cause temperature increases
 * - The lens will throttle performance or suspend operation if temperature exceeds safe levels
 * - User will be notified of temperature warnings through the companion app
 * 
 * Security:
 * - All communication is encrypted using AES-256
 * - Authentication is required before control commands are accepted
 * - Privacy indicators cannot be disabled in firmware to ensure ethical use
 */
