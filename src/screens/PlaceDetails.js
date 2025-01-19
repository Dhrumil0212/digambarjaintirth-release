import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  Platform,
} from "react-native";
import WebView from "react-native-webview";  // Import WebView
import { getPlaceByName } from "../services/getStateENG";
import { imageMapping } from "../config/imageMapping";
import { styles } from "../styles/placeStyles";
import { stateMapping } from "../config/stateMap";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import finalData from "../data/final.json";
import NetInfo from "@react-native-community/netinfo"; // Import NetInfo to check internet status

const PlaceDetails = ({ route }) => {
  const { placeName, stateName } = route.params;

  const [place, setPlace] = useState(null);
  const [images, setImages] = useState([]);
  const [isConnected, setIsConnected] = useState(true); // Track internet connection status

  useEffect(() => {
    // Check network status
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Fetch place data and images
    getPlaceByName(placeName)
      .then((placeData) => {
        setPlace(placeData);
        loadImages(stateName, placeName);
      })
      .catch(() => setPlace({ error: true }));

    return () => unsubscribe(); // Unsubscribe from NetInfo on cleanup
  }, [placeName, stateName]);

  const loadImages = (state, place) => {
    if (!state || !imageMapping[state]) return;

    const placeImages = imageMapping[state]?.[place];
    if (placeImages?.length > 0) {
      setImages(placeImages);
    }
  };

  const renderFields = (placeName) => {
    const placeData = finalData.Sheet1.filter(
      (item) => item["Name teerth"] === placeName
    );

    if (placeData.length === 0) return null;

    const uniqueFields = {};
    placeData.forEach((item) => {
      if (
        item["Key"] === "Formatted Text" ||
        item["Key"] === "Original Value" ||
        item["Key"] === "Tirth" ||
        item["Key"] === "Name teerth" ||
        item["Key"] === "Naam" ||
        item["Key"] === "State" ||
        item["Key"] === "Rajya"
      ) {
        return;
      }

      const key = item["Translated Key"] || item["Key"];
      const value = item["Translated Value"] || item["Original Value"];
      if (!uniqueFields[key]) {
        uniqueFields[key] = value;
      }
    });

    return Object.keys(uniqueFields).map((key) => (
      <View key={key} style={styles.section}>
        <Text style={styles.sectionTitle}>{key}:</Text>
        <Text style={styles.textContent}>{uniqueFields[key]}</Text>
      </View>
    ));
  };

  const handleImageError = (index) => {
    console.log(`Failed to load image at index ${index}`);
    setImages((prevImages) => {
      const newImages = [...prevImages];
      newImages[index] = null;
      return newImages.filter((img) => img !== null);
    });
  };

  if (!place) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#343a40" />
        <Text style={styles.loadingText}>Loading place details...</Text>
      </View>
    );
  }

  if (place.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Failed to load place details. Please try again later.
        </Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          No internet connection. Please connect to the internet to view images.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{place["Name teerth"]}</Text>

      {/* Image Slider */}
      <ScrollView horizontal style={styles.imageSlider}>
        {images.length > 0 ? (
          images.map((img, index) =>
            img ? (
              <Image
                key={index}
                source={{ uri: img }} // Use uri to load image from URL
                style={styles.image}
                onError={() => handleImageError(index)}
              />
            ) : (
              <Text key={index} style={styles.noImageText}>
                Image not available
              </Text>
            )
          )
        ) : (
          <Text style={styles.noImageText}>No images available</Text>
        )}
      </ScrollView>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        {renderFields(place["Name teerth"])}

        {/* WebView for Google Maps */}
        {place.latitude && place.longitude && (
          <TouchableOpacity
            style={styles.mapContainer}
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps?q=${place.latitude},${place.longitude}`
              ).catch((err) => console.error("Error opening map:", err))
            }
          >
            <WebView
              originWhitelist={["*"]}
              source={{
                uri: `https://www.google.com/maps?q=${place.latitude},${place.longitude}`,
              }}
              style={styles.webviewMap} // Style the WebView map
            />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default PlaceDetails;
