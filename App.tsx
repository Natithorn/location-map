
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Alert, TextInput, FlatList, TouchableOpacity } from "react-native";
type SavedLocation = {
  latitude: number;
  longitude: number;
  name: string;
  description: string;
};
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

export default function App() {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [placeDesc, setPlaceDesc] = useState("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const handleSaveLocation = () => {
    if (!location) {
      Alert.alert("ยังไม่ได้เลือกตำแหน่ง", "กรุณาหาตำแหน่งก่อนบันทึก");
      return;
    }
    if (!placeName.trim()) {
      Alert.alert("กรุณากรอกชื่อสถานที่");
      return;
    }
    setSavedLocations([
      ...savedLocations,
      {
        latitude: location.latitude,
        longitude: location.longitude,
        name: placeName,
        description: placeDesc,
      },
    ]);
    setShowSaveForm(false);
    setPlaceName("");
    setPlaceDesc("");
    Alert.alert("บันทึกสำเร็จ", "สถานที่ถูกบันทึกแล้ว");
  };
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
    heading?: number;
    speed?: number;
  } | null>(null);
  const [region, setRegion] = useState({
    latitude: 17.803266,
    longitude: 102.747888,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Cannot access location");
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy ?? undefined,
      altitude: loc.coords.altitude ?? undefined,
      heading: loc.coords.heading ?? undefined,
      speed: loc.coords.speed ?? undefined,
    });
    setRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_DEFAULT}
        region={region}
        showsUserLocation={true}
        style={{ flex: 1 }}
      >
        <Marker
          coordinate={{
            latitude: location ? location.latitude : 17.803266,
            longitude: location ? location.longitude : 102.747888,
          }}
          title="My location"
          description="I am here"
          pinColor="blue"
        />
        {savedLocations.map((loc, idx) => (
          <Marker
            key={idx}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={loc.description}
            pinColor={selectedIdx === idx ? "red" : "green"}
          />
        ))}
      </MapView>
      <View style={{ position: "absolute", top: 40, right: 20, gap: 10 }}>
        <Button title="หาตำแหน่งปัจจุบัน" onPress={getCurrentLocation} />
        <Button title="บันทึกสถานที่" onPress={() => setShowSaveForm(true)} />
      </View>
      {showSaveForm && (
        <View style={styles.saveForm}>
          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>บันทึกสถานที่</Text>
          <TextInput
            placeholder="ชื่อสถานที่"
            value={placeName}
            onChangeText={setPlaceName}
            style={styles.input}
          />
          <TextInput
            placeholder="คำบรรยาย"
            value={placeDesc}
            onChangeText={setPlaceDesc}
            style={styles.input}
          />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <Button title="บันทึก" onPress={handleSaveLocation} />
            <Button title="ยกเลิก" color="gray" onPress={() => setShowSaveForm(false)} />
          </View>
        </View>
      )}
      {savedLocations.length > 0 && (
        <View style={styles.savedList}>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>รายการสถานที่ที่บันทึก</Text>
          <FlatList
            data={savedLocations}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.savedItem, selectedIdx === index && { backgroundColor: '#ffeaea' }]}
                onPress={() => {
                  setRegion({
                    latitude: item.latitude,
                    longitude: item.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  });
                  setSelectedIdx(index);
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                <Text>{item.description}</Text>
                <Text style={{ fontSize: 12, color: "#555" }}>
                  lat: {item.latitude.toFixed(5)}, lng: {item.longitude.toFixed(5)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  saveForm: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 220,
    zIndex: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  savedList: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: 200,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  savedItem: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
