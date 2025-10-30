import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Roam from 'roam-reactnative';

const App = () => {
  const [locationData, setLocationData] = useState(null);

  const requestPhoneStatePermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        {
          title: 'Phone State Permission',
          message: 'App needs phone state access to work properly.',
          buttonPositive: 'OK',
        }
      );
      console.log(
        granted === PermissionsAndroid.RESULTS.GRANTED
          ? 'Phone permission granted'
          : 'Phone permission denied'
      );
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs location access for tracking.',
          buttonPositive: 'OK',
        }
      );
    }
  };

  useEffect(() => {
    const listener = Roam.startListener('location', (location) => {
      console.log('📍 Location received:', location);
      setLocationData(location);
    });

    return () => Roam.stopListener('location');
  }, []);

  const setupForegroundNotification = () => {
    if (Platform.OS === 'android') {
      Roam.setForegroundNotification(
        true,
        'Tracking Active',
        'Tap to open app',
        'mipmap/ic_launcher',
        'com.sampleandroidwhileusingbatchlistener',
        'com.roam.reactnative.LocationService'
      );
    }
  };

  const startTracking = async () => {
    await requestPhoneStatePermission();
    Roam.batchProcess(true, 0);
    setupForegroundNotification();
    Roam.allowMockLocation(true);
    Roam.startTracking();
  };

  const stopTracking = () => {
    Roam.stopTracking();
    Roam.stopListener('location');
    setLocationData(null);
  };

  const locationItem = Array.isArray(locationData)
    ? locationData[0]
    : locationData || {};
  const location = locationItem.location || {};
  const otherDetails = { ...locationItem };
  delete otherDetails.location;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={requestLocationPermission} style={styles.button}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={startTracking} style={styles.button}>
            <Text style={styles.buttonText}>Start Tracking</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={stopTracking} style={[styles.button, styles.stop]}>
            <Text style={styles.buttonText}>Stop Tracking</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dataBox}>
          <Text style={styles.title}>📍 Location Data</Text>

          {Object.keys(location).length > 0 ? (
            Object.entries(location).map(([key, value]) => (
              <Text key={key} style={styles.dataText}>
                {key}: {String(value)}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>No location data available</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.title}>📡 Device Info</Text>
          {Object.keys(otherDetails).length > 0 ? (
            Object.entries(otherDetails).map(([key, value]) => (
              <Text key={key} style={styles.dataText}>
                {key}: {String(value)}
              </Text>
            ))
          ) : (
            <Text style={styles.emptyText}>No device info available</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  scroll: { padding: 20, alignItems: 'center' },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 6,
  },
  stop: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#fff', fontWeight: '600' },
  buttonRow: { flexDirection: 'row', marginVertical: 10 },
  dataBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    marginTop: 20,
    elevation: 2,
  },
  title: { fontWeight: '700', fontSize: 16, marginBottom: 8 },
  dataText: { color: '#333', marginBottom: 4 },
  emptyText: { color: '#666', fontStyle: 'italic' },
  divider: { borderBottomWidth: 1, borderColor: '#ddd', marginVertical: 10 },
});
