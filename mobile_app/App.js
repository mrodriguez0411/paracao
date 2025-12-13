import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Linking, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const handleWhatsAppPress = () => {
    // Replace with your WhatsApp number in the format 549XXXXXXXX
    const phoneNumber = '5493434050651'; 
    const url = `https://wa.me/${phoneNumber}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        return Linking.openURL(`https://api.whatsapp.com/send?phone=${phoneNumber}`);
      }
    }).catch(err => console.error('Error opening WhatsApp:', err));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Your app content goes here */}
        <View style={styles.content}>
          <Text style={styles.text}>Contenido de la aplicación</Text>
          <Text style={styles.text}>Desliza hacia abajo para ver el botón flotante</Text>
          <View style={{ height: 1000 }}></View> {/* Spacer para hacer scroll */}
        </View>
      </ScrollView>

      {/* Floating WhatsApp Button */}
      <TouchableOpacity 
        style={styles.whatsappButton}
        onPress={handleWhatsAppPress}
        activeOpacity={0.8}
      >
        <Ionicons name="logo-whatsapp" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  whatsappButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#25D366',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
