// App.js - Main application file for HEART'N'EYES mobile companion app
import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  StatusBar,
  PermissionsAndroid,
  Platform
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Mock service and characteristic UUIDs for the contact lens hardware
const LENS_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const LENS_VIDEO_CHARACTERISTIC = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
const LENS_CONTROL_CHARACTERISTIC = '2a56b1fa-c676-4471-95a2-6c3e15a8e063';

const App = () => {
  const [bleManager, setBleManager] = useState(null);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [videoBuffer, setVideoBuffer] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  
  // Initialize BLE manager
  useEffect(() => {
    const manager = new BleManager();
    setBleManager(manager);
    
    // Setup event listeners for BLE state changes
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        scanAndConnect();
        subscription.remove();
      }
    }, true);
    
    return () => {
      manager.destroy();
    };
  }, []);
  
  // Request necessary permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      
      return (
        granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted' &&
        granted['android.permission.CAMERA'] === 'granted' &&
        granted['android.permission.RECORD_AUDIO'] === 'granted'
      );
    }
    return true;
  };
  
  // Scan for and connect to the lens device
  const scanAndConnect = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions || !bleManager) return;
    
    console.log('Scanning for HEART\'N\'EYES lens device...');
    
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('BLE scan error:', error);
        return;
      }
      
      // Look for devices with the name pattern or advertised service
      if (device.name && device.name.includes('HEARTNEYES') || 
          (device.serviceUUIDs && device.serviceUUIDs.includes(LENS_SERVICE_UUID))) {
        
        console.log('Found HEART\'N\'EYES lens device:', device.name);
        bleManager.stopDeviceScan();
        
        device.connect()
          .then((device) => {
            console.log('Connected to lens device');
            return device.discoverAllServicesAndCharacteristics();
          })
          .then((device) => {
            console.log('Discovered services and characteristics');
            setDeviceConnected(true);
            setupNotifications(device);
            monitorBatteryLevel(device);
          })
          .catch((error) => {
            console.error('Connection error:', error);
          });
      }
    });
  };
  
  // Setup notifications for incoming video data
  const setupNotifications = (device) => {
    device.monitorCharacteristicForService(
      LENS_SERVICE_UUID,
      LENS_VIDEO_CHARACTERISTIC,
      (error, characteristic) => {
        if (error) {
          console.error('Notification error:', error);
          return;
        }
        
        if (characteristic.value) {
          const chunk = Buffer.from(characteristic.value, 'base64');
          // In a real app, this would handle video frame assembly
          processVideoChunk(chunk);
        }
      }
    );
  };
  
  // Monitor battery level
  const monitorBatteryLevel = (device) => {
    // Simplified for concept - would use standard battery service in real implementation
    device.readCharacteristicForService(
      LENS_SERVICE_UUID,
      'battery_level_characteristic_uuid',
      (error, characteristic) => {
        if (characteristic && characteristic.value) {
          const batteryBytes = Buffer.from(characteristic.value, 'base64');
          setBatteryLevel(batteryBytes[0]);
        }
      }
    );
  };
  
  // Process incoming video chunks
  const processVideoChunk = (chunk) => {
    // This is simplified - real implementation would handle H.264/H.265 encoding
    // and proper video buffer management
    
    // For demo, we're just simulating receiving video data
    if (isRecording) {
      // Append to recording buffer
      console.log('Recording video chunk, size:', chunk.length);
      // In a real app: recordingManager.appendChunk(chunk);
    }
    
    if (isLiveStreaming) {
      // Send to streaming service
      console.log('Streaming video chunk, size:', chunk.length);
      // In a real app: streamingManager.sendChunk(chunk);
    }
  };
  
  // Toggle recording state
  const toggleRecording = async () => {
    if (!deviceConnected) return;
    
    const newState = !isRecording;
    setIsRecording(newState);
    
    // Send command to lens to start/stop recording
    if (bleManager) {
      try {
        await bleManager.writeCharacteristicWithResponseForDevice(
          /* device id would be stored */,
          LENS_SERVICE_UUID,
          LENS_CONTROL_CHARACTERISTIC,
          Buffer.from([newState ? 0x01 : 0x00]).toString('base64')
        );
        console.log(newState ? 'Started recording' : 'Stopped recording');
        
        if (!newState && videoBuffer) {
          // Save recording
          console.log('Saving recording...');
          // In a real app: saveRecording(videoBuffer);
          setVideoBuffer(null);
        }
      } catch (error) {
        console.error('Failed to toggle recording:', error);
      }
    }
  };
  
  // Toggle streaming state
  const toggleStreaming = async () => {
    if (!deviceConnected) return;
    
    const newState = !isLiveStreaming;
    setIsLiveStreaming(newState);
    
    if (newState) {
      // Initialize streaming session
      try {
        const response = await fetch('https://api.heartneyes.example/stream/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: 'current_user_id',
            streamTitle: 'Live from my eyes!',
            platform: 'youtube' // or 'twitch', 'custom', etc.
          })
        });
        
        const data = await response.json();
        setStreamUrl(data.streamUrl);
        console.log('Stream started:', data.streamUrl);
        
      } catch (error) {
        console.error('Failed to start stream:', error);
        setIsLiveStreaming(false);
      }
    } else {
      // End streaming session
      console.log('Ending stream...');
      setStreamUrl(null);
      // In a real app: await endStreamSession();
    }
  };
  
  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>HEART'N'EYES</Text>
          <View style={styles.batteryContainer}>
            <Icon name="battery" size={20} color="#4CAF50" />
            <Text style={styles.batteryText}>{batteryLevel}%</Text>
          </View>
        </View>
        
        <View style={styles.previewContainer}>
          {videoBuffer ? (
            <Video
              source={{ uri: 'data:video/mp4;base64,' + videoBuffer.toString('base64') }}
              style={styles.videoPreview}
              resizeMode="cover"
              repeat
            />
          ) : (
            <View style={styles.noPreview}>
              <Icon name="eye-off-outline" size={50} color="#FFF" />
              <Text style={styles.noPreviewText}>No lens feed available</Text>
              {!deviceConnected && (
                <TouchableOpacity style={styles.connectButton} onPress={scanAndConnect}>
                  <Text style={styles.connectButtonText}>Connect to Lens</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.statusBar}>
          <View style={[styles.statusIndicator, { backgroundColor: deviceConnected ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.statusText}>{deviceConnected ? 'Connected' : 'Disconnected'}</Text>
          </View>
          {isRecording && (
            <View style={[styles.statusIndicator, { backgroundColor: '#FF5722' }]}>
              <Text style={styles.statusText}>Recording</Text>
            </View>
          )}
          {isLiveStreaming && (
            <View style={[styles.statusIndicator, { backgroundColor: '#2196F3' }]}>
              <Text style={styles.statusText}>Live</Text>
            </View>
          )}
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.controlButton, isRecording && styles.activeButton]}
            onPress={toggleRecording}
            disabled={!deviceConnected}
          >
            <Icon name="record-circle-outline" size={30} color="#FFF" />
            <Text style={styles.buttonText}>Record</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, isLiveStreaming && styles.activeButton]}
            onPress={toggleStreaming}
            disabled={!deviceConnected}
          >
            <Icon name="access-point" size={30} color="#FFF" />
            <Text style={styles.buttonText}>Stream</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            disabled={!deviceConnected}
          >
            <Icon name="cog-outline" size={30} color="#FFF" />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </View>
        
        {streamUrl && (
          <View style={styles.streamInfo}>
            <Text style={styles.streamUrl}>Live at: {streamUrl}</Text>
            <TouchableOpacity style={styles.shareButton}>
              <Icon name="share-variant" size={20} color="#FFF" />
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E1E1E',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    color: '#FFF',
    marginLeft: 5,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  noPreview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPreviewText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
  connectButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  connectButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  statusBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1E1E1E',
  },
  statusIndicator: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#1E1E1E',
  },
  controlButton: {
    alignItems: 'center',
    opacity: 0.8,
  },
  activeButton: {
    opacity: 1,
  },
  buttonText: {
    color: '#FFF',
    marginTop: 5,
  },
  streamInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E1E1E',
  },
  streamUrl: {
    color: '#FFF',
    fontSize: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  shareText: {
    color: '#FFF',
    marginLeft: 5,
  },
});

export default App;
