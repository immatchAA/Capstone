import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';

const MainLanding = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [classKey, setClassKey] = useState('');


  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    if (isSideNavVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isSideNavVisible]);


  const openHelpModalWithMessage = (message) => {
    setModalMessage(message);
    setIsModalVisible(true);
  };

  const closeHelpModal = () => setIsModalVisible(false);


  return (

    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle} />
          <Text style={styles.logoText}>ARchiQuest</Text>
        </View>
        <TouchableOpacity style={styles.profileIcon} onPress={() => setIsSideNavVisible(true)}>
          <Ionicons name="menu-outline" size={30} color="#176BB7" />
        </TouchableOpacity>
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

        <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={closeHelpModal}>
            <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
        </View>
        </View>
    </View>
    </Modal>

    <Modal
  transparent={true}
  visible={isSideNavVisible}
  animationType="none"
  onRequestClose={() => setIsSideNavVisible(false)}
>
  <TouchableOpacity
    activeOpacity={1}
    onPress={() => setIsSideNavVisible(false)}
    style={styles.fullScreenTouchable}
  >
    <View style={styles.sideNavWrapper}>
      <Animated.View
        style={[styles.sideNav, { transform: [{ translateX: slideAnim }] }]}
      >
        <Text style={styles.sideNavTitle}>Menu</Text>

        <TouchableOpacity style={styles.sideNavItem}>
          <Text style={styles.sideNavItemText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideNavItem}>
          <Text style={styles.sideNavItemText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideNavItem}
          onPress={() => {
            setIsSideNavVisible(false);
            navigation.navigate('Modules');
          }}
        >
  <Text style={styles.sideNavItemText}>Modules</Text>
</TouchableOpacity>



        <TouchableOpacity
          style={styles.sideNavItem}
          onPress={() => {
            setIsSideNavVisible(false);
            setIsJoinModalVisible(true);
          }}
        >
          <Text style={styles.sideNavItemText}>Join Class</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.sideNavItem, { marginBottom: 20 }]}
          onPress={() => {
            alert('Logging out...');
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  </TouchableOpacity>
</Modal>


<Modal
  transparent={true}
  visible={isJoinModalVisible}
  animationType="fade"
  onRequestClose={() => setIsJoinModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalText}>Enter Class Key</Text>

      <View style={{ width: '100%', marginBottom: 16 }}>
        <TextInput
          style={styles.input}
          placeholder=" "
          value={classKey}
          onChangeText={setClassKey}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.buttonRow}>
      <TouchableOpacity
  style={styles.modalCloseButton}
  onPress={async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("Unable to fetch user. Please log in.");
        return;
      }

      const studentId = user.id;

      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('class_key', classKey)
        .single();

      if (classError || !classData) {
        alert("Class key not found.");
        return;
      }

      const classId = classData.id;

      const { error: insertError } = await supabase.from('class_students').insert([
        {
          class_id: classId,
          student_id: studentId,
          joined_at: new Date().toISOString(),
        }
      ]);

      if (insertError) {
        alert("Failed to join class: " + insertError.message);
        return;
      }

      alert("✅ Successfully joined the class!");
      setIsJoinModalVisible(false);
      setClassKey('');
    } catch (err) {
      alert("An error occurred: " + err.message);
    }
  }}
>
  <Text style={styles.modalCloseText}>Join Class</Text>
</TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalCloseButton, { backgroundColor: '#EEF5FF' }]}
          onPress={() => setIsJoinModalVisible(false)}
        >
          <Text style={[styles.modalCloseText, { color: '#333' }]}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

  <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            onPress={() => openHelpModalWithMessage('What hafen Bella? Why u crying again? I know vamfyre right?')}
            style={styles.helpIcon}
            >
            <Ionicons name="help-circle-outline" size={20} color="#176BB7" />
        </TouchableOpacity>
      </View>
    </View>

  </ScrollView>
</View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f0f4f7',
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  header: {
  backgroundColor: '#f0f4f7',
  paddingVertical: 10,
  paddingHorizontal: '1%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: 60,
},

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
},

  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#176BB7',
  },
  
  welcomeText: {
    fontSize: 18,
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
    paddingBottom: 100,
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

  profileIcon: {
  position: 'absolute',
  right: 16,
  top: 12,
},

sideNavOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
},

sideNavOverlayTouchable: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)',
  width: '30%',
},

sideNav: {
  backgroundColor: '#EEF5FF',
  width: '45%',
  height: '91.9%',
  paddingHorizontal: 20,
  paddingVertical: 20,
  shadowColor: '#000',
  shadowOffset: { width: -2, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 8,
},


sideNavTitle: {
  fontSize: 25,
  fontWeight: '500',
  color: '#176BB7',
  marginBottom: 20,
},

sideNavItem: {
  paddingVertical: 12,
},

sideNavItemText: {
  fontSize: 16,
  color: '#176BB7',
  fontWeight: '500',
},

closeSideNavText: {
  marginTop: 30,
  color: '#176BB7',
  fontWeight: '600',
},

input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  padding: 10,
  width: '100%',
  fontSize: 16,
  color: '#333',
  backgroundColor: '#f9f9f9',
},

buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
},

logoutText: {
  fontSize: 16,
  color: 'red',
  fontWeight: '600',
},

fullScreenTouchable: {
  flex: 1,
},

sideNavWrapper: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
},


});

export default MainLanding;