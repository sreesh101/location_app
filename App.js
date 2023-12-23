import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Text, TextInput, Button } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState(null);
  const mapViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleSearch = async () => {
    if (searchQuery === '') return;

    try {
      let geocode = await Location.geocodeAsync(searchQuery);
      if (geocode.length > 0) {
        setSearchedLocation({
          latitude: geocode[0].latitude,
          longitude: geocode[0].longitude,
        });
        mapViewRef.current.animateToRegion({
          latitude: geocode[0].latitude,
          longitude: geocode[0].longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.05,
        }, 1000);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const goToUserLocation = () => {
    if (location) {
      setSearchedLocation(null);
      mapViewRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.09,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Bus O' Clock</Text>
      </View>
      <View style={styles.mapContainer}>
        {location && (
        <MapView
          ref={mapViewRef}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.04,
          }}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              description="You are here"
              pinColor="blue"
            />
          )}
          {searchedLocation && (
            <Marker
              coordinate={{
                latitude: searchedLocation.latitude,
                longitude: searchedLocation.longitude,
              }}
              title="Searched Location"
              description="Your searched location"
              pinColor="red"
            />
          )}
        </MapView>
        )}
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search location"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          <Button title="Search" onPress={handleSearch} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Go to My Location" onPress={goToUserLocation} />
        </View>
      </View>
      {errorMsg && <Text>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#004EC2',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#ffe500',
    fontSize: 30,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  searchBar: {
    backgroundColor: 'white',
    flex: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
});
