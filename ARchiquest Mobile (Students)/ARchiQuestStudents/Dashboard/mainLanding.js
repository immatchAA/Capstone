import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const MainLandingPage = () => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const openHelpModalWithMessage = (message) => {
    setModalMessage(message);
    setIsModalVisible(true);
  };

  const closeHelpModal = () => setIsModalVisible(false);

  return (

    <View style={styles.container}>
      {/* Header with circle + logo text */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle} />
          <Text style={styles.logoText}>ARchiQuest</Text>
        </View>
      </View>

    <Modal
    animationType="fade"
    transparent={true}
    visible={isModalVisible}
    onRequestClose={closeHelpModal}
    >
    <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
        <Text style={styles.modalText}>{modalMessage}</Text>

        {/* Center the close button below the text */}
        <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeHelpModal}>
            <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
        </View>
        </View>
    </View>
    </Modal>

  <ScrollView contentContainerStyle={styles.scrollContent}>
    <Text style={styles.welcomeText}>Welcome to ARchiQuest</Text>

    <View style={styles.card}>
      <View style={styles.loadingPlaceholder} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>AR Scavenger Hunt</Text>
        <TouchableOpacity style={styles.cardButton}>
          <Text style={styles.cardButtonText}>START</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => openHelpModalWithMessage(
            `📘 How to Play
              
              1️⃣ Point your camera at architectural elements in your environment.
              
              2️⃣ The app will identify elements and provide information about them.
              
              3️⃣ Complete challenges by fintoding specific architectural features.`
              )}
            style={styles.helpIcon}
            >
            <Ionicons name="help-circle-outline" size={20} color="#176BB7" />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.card}>
      <View style={styles.loadingPlaceholder} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>Cost Estimate Simulator</Text>
        <TouchableOpacity style={styles.cardButton}>
          <Text style={styles.cardButtonText}>START</Text> 
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => openHelpModalWithMessage(
                `📘 How to Play
                  
                  1️⃣ Select materials and components from the catalog.
                  
                  2️⃣ Estimate quantities and calculate costs for your project.
                  
                  3️⃣ Balance your budget while meeting all project requirements.`
                  )}
            style={styles.helpIcon}
            >
            <Ionicons name="help-circle-outline" size={20} color="#176BB7" />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.card}>
      <View style={styles.loadingPlaceholder} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>Game PlaceHolder</Text>
        <TouchableOpacity style={styles.cardButton}>
          <Text style={styles.cardButtonText}>START</Text>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => openHelpModalWithMessage('ZAAAAAAAAAAAAAAAAAA')}
            style={styles.helpIcon}
            >
            <Ionicons name="help-circle-outline" size={20} color="#176BB7" />
        </TouchableOpacity>
      </View>
    </View>

    {/* Add more cards here */}
  </ScrollView>
</View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#EEF5FF',
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  header: {
    backgroundColor: '#eaf2ff',
    paddingVertical: 10, 
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 60, 
  },

  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#176BB7',
  },
  
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#B4D4FF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },

  loadingPlaceholder: {
    backgroundColor: '#E0EDFF',
    height: 300,
    borderRadius: 16,
    marginBottom: 12,
  },

  cardInfo: {
    marginTop: 8,
  },
  
  cardTitle: {
    fontWeight: '700',
    color: '#1E4F91',
    fontSize: 16,
    marginBottom: 12,
  },
  
  cardButton: {
    backgroundColor: '#B4D4FF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },

  cardButtonText: {
    color: '#1E4F91',
    fontWeight: '600',
    fontSize: 14,
  },  

  helpIcon: {
    position: 'absolute',
    right: 0,
    top: -2,
  },

  scrollContent: {
    paddingBottom: 100, // so last card isn’t hidden behind nav bar
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  
  modalText: {
    fontSize: 16,
    color: '#1E4F91',
    textAlign: 'left',
    marginBottom: 16,
    fontWeight: '500',
    width: '100%',
  },
  
  modalCloseButton: {
    backgroundColor: '#B4D4FF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  
  modalCloseText: {
    color: '#1E4F91',
    fontWeight: '600',
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#80b4ff',
    marginRight: 8,
  },

});

export default MainLandingPage;