import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Animated, Dimensions, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import CostEstimateSimulator from './CostEstimateSimulator/CostEstimateSimulator';

const MainLanding = () => {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [classKey, setClassKey] = useState('');
  const [showCostEstimator, setShowCostEstimator] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [activeClasses, setActiveClasses] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    // Fetch student name from Supabase
    fetchStudentName();
    // Fetch active classes
    fetchActiveClasses();
  }, []);

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

  const fetchStudentName = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Unable to fetch user");
        return;
      }

      // Updated to query the "user" table instead of "profiles"
      const { data, error } = await supabase
        .from('users')
        .select('first_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching student name:", error);
        return;
      }

      if (data && data.first_name) {
        setStudentName(data.first_name);
      }
    } catch (err) {
      console.error("Error in fetchStudentName:", err);
    }
  };

  const fetchActiveClasses = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Unable to fetch user");
        return;
      }

      // Get classes the student is enrolled in
      const { data, error } = await supabase
        .from('class_students')
        .select(`
          class_id,
          classes:class_id (
            id,
            class_key,
            teacher_id,
            created_at
          )
        `)
        .eq('student_id', user.id);

      if (error) {
        console.error("Error fetching classes:", error);
        return;
      }

      if (data) {
        const classes = data.map(item => item.classes);
        setActiveClasses(classes);
      }
    } catch (err) {
      console.error("Error in fetchActiveClasses:", err);
    }
  };

  const openHelpModalWithMessage = (message) => {
    setModalMessage(message);
    setIsModalVisible(true);
  };

  const closeHelpModal = () => setIsModalVisible(false);

  const handleJoinClass = async () => {
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
      fetchActiveClasses(); // Refresh the class list
    } catch (err) {
      alert("An error occurred: " + err.message);
    }
  };

  // Handle navigation to DesignPlanViewer
  const handleNavigateToDesignPlan = (classId, classKey) => {
    if (navigation) {
      navigation.navigate('DesignPlanViewer', {
        classId: classId,
        classKey: classKey
      });
    } else {
      console.error("Navigation is not available");
    }
  };

// Logout function
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              const { error } = await supabase.auth.signOut();
              
              if (error) {
                console.error("Error signing out:", error);
                Alert.alert("Error", "Failed to logout. Please try again.");
              } else {
                // Try different navigation approaches based on what's available
                if (navigation) {
                  // Option 1: Navigate to a screen that exists in your app
                  // This could be 'Auth', 'SignIn', 'Welcome', etc.
                  try {
                    // First try to navigate to Login
                    navigation.navigate('UserLogin');
                  } catch (navError) {
                    console.log("Could not navigate to Login, trying Auth");
                    try {
                      // If Login doesn't exist, try Auth
                      navigation.navigate('Auth');
                    } catch (navError2) {
                      console.log("Could not navigate to Auth, trying SignIn");
                      try {
                        // If Auth doesn't exist, try SignIn
                        navigation.navigate('SignIn');
                      } catch (navError3) {
                        console.log("Could not navigate to SignIn, trying Welcome");
                        try {
                          // If SignIn doesn't exist, try Welcome
                          navigation.navigate('Welcome');
                        } catch (navError4) {
                          console.error("Navigation failed:", navError4);
                          Alert.alert(
                            "Logout Successful", 
                            "Please restart the app to sign in again."
                          );
                        }
                      }
                    }
                  }
                } else {
                  Alert.alert(
                    "Logout Successful", 
                    "Please restart the app to sign in again."
                  );
                }
              }
            } catch (err) {
              console.error("Error in handleLogout:", err);
              Alert.alert("Error", "An unexpected error occurred. Please try again.");
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  // If showing the cost estimator, render that component
  if (showCostEstimator) {
    return <CostEstimateSimulator onBack={() => setShowCostEstimator(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Left Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle} />
          {/* Removed the Text component to avoid the fontSize error */}
        </View>
        
        <View style={styles.sidebarMenu}>
          <TouchableOpacity style={styles.sidebarMenuItem}>
            <Ionicons name="home-outline" size={24} color="#176BB7" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sidebarMenuItem}>
            <Ionicons name="person-outline" size={24} color="#176BB7" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sidebarMenuItem}>
            <Ionicons name="book-outline" size={24} color="#176BB7" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sidebarMenuItem}>
            <Ionicons name="code-outline" size={24} color="#176BB7" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sidebarMenuItem}>
            <Ionicons name="settings-outline" size={24} color="#176BB7" />
          </TouchableOpacity>
          
          {/* Logout Button */}
          <TouchableOpacity 
            style={[styles.sidebarMenuItem, styles.logoutButton]}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>
              Welcome, {studentName || 'Student'}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="call-outline" size={20} color="#176BB7" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={20} color="#176BB7" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => {
                Alert.alert(
                  "Profile Options",
                  "Select an option",
                  [
                    {
                      text: "View Profile",
                      onPress: () => console.log("View Profile pressed")
                    },
                    {
                      text: "Logout",
                      onPress: handleLogout,
                      style: "destructive"
                    },
                    {
                      text: "Cancel",
                      style: "cancel"
                    }
                  ]
                );
              }}
            >
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>{studentName ? studentName[0] : 'S'}</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.studentBadge}>
              <Text style={styles.studentBadgeText}>STUDENT</Text>
            </View>
          </View>
        </View>

        {/* Content Area */}
        <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Active Classes</Text>
          
          <View style={styles.classesGrid}>
            {activeClasses.length > 0 ? (
              activeClasses.map((classItem, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.classCard}
                  onPress={() => handleNavigateToDesignPlan(classItem.id, classItem.class_key)}
                >
                  <View style={styles.classImageContainer}>
                    <View style={[styles.classImagePlaceholder, { backgroundColor: '#FFE5E5' }]}>
                      <Ionicons name="school-outline" size={40} color="#FF6B6B" />
                    </View>
                  </View>
                  <Text style={styles.className}>Class #{classItem.id}</Text>
                  <Text style={styles.classDescription}>
                    Key: {classItem.class_key}
                  </Text>
                  <Text style={styles.classDescription}>
                    Joined: {new Date(classItem.created_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noClassesText}>No active classes found</Text>
            )}
            
            {/* Join Class Card */}
            <TouchableOpacity 
              style={styles.joinClassCard}
              onPress={() => setIsJoinModalVisible(true)}
            >
              <View style={styles.joinClassContent}>
                <Ionicons name="add-circle-outline" size={32} color="#176BB7" />
                <Text style={styles.joinClassText}>Join class</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Learning Activities</Text>
          
          <View style={styles.activitiesGrid}>
            <TouchableOpacity 
              style={styles.activityCard}
              onPress={() => setShowCostEstimator(true)}
            >
              <View style={styles.activityImageContainer}>
                <View style={[styles.activityImagePlaceholder, { backgroundColor: '#E0EDFF' }]}>
                  <Ionicons name="calculator-outline" size={40} color="#176BB7" />
                </View>
              </View>
              <Text style={styles.activityName}>Cost Estimate Simulator</Text>
              <Text style={styles.activityDescription} numberOfLines={2}>
                Estimate construction costs and manage project budgets
              </Text>
              <TouchableOpacity 
                style={styles.activityButton}
                onPress={() => setShowCostEstimator(true)}
              >
                <Text style={styles.activityButtonText}>START</Text>
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
            </TouchableOpacity>

            <TouchableOpacity style={styles.activityCard}>
              <View style={styles.activityImageContainer}>
                <View style={[styles.activityImagePlaceholder, { backgroundColor: '#FFE5E5' }]}>
                  <Ionicons name="search-outline" size={40} color="#FF6B6B" />
                </View>
              </View>
              <Text style={styles.activityName}>AR Scavenger Hunt</Text>
              <Text style={styles.activityDescription} numberOfLines={2}>
                Find architectural elements in your environment
              </Text>
              <TouchableOpacity style={styles.activityButton}>
                <Text style={styles.activityButtonText}>START</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openHelpModalWithMessage(
                  `📘 How to Play
                    
                    1️⃣ Point your camera at architectural elements in your environment.
                    
                    2️⃣ The app will identify elements and provide information about them.
                    
                    3️⃣ Complete challenges by finding specific architectural features.`
                )}
                style={styles.helpIcon}
              >
                <Ionicons name="help-circle-outline" size={20} color="#176BB7" />
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity style={styles.activityCard}>
              <View style={styles.activityImageContainer}>
                <View style={[styles.activityImagePlaceholder, { backgroundColor: '#E6F7ED' }]}>
                  <Ionicons name="game-controller-outline" size={40} color="#38B27B" />
                </View>
              </View>
              <Text style={styles.activityName}>Game PlaceHolder</Text>
              <Text style={styles.activityDescription} numberOfLines={2}>
                Coming soon: New interactive learning game
              </Text>
              <TouchableOpacity style={styles.activityButton}>
                <Text style={styles.activityButtonText}>START</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openHelpModalWithMessage('This game is coming soon!')}
                style={styles.helpIcon}
              >
                <Ionicons name="help-circle-outline" size={20} color="#176BB7" />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Help Modal */}
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

      {/* Join Class Modal */}
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
                placeholder="Enter class key"
                value={classKey}
                onChangeText={setClassKey}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleJoinClass}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f0f4f7',
  },
  sidebar: {
    width: 60,
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#80b4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarMenu: {
    alignItems: 'center',
    flex: 1, // Make the menu take up all available space
  },
  sidebarMenuItem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 'auto', // Push the logout button to the bottom
    backgroundColor: '#FFF0F0', // Light red background
    marginBottom: 20, // Add some margin at the bottom
  },
  mainContent: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#176BB7',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  profileButton: {
    marginLeft: 10,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B4D4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#176BB7',
  },
  studentBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  studentBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  classCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: '4%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  classImageContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  classImage: {
    width: '100%',
    height: '100%',
  },
  classImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E4F91',
    marginBottom: 4,
  },
  classDescription: {
    fontSize: 14,
    color: '#666',
  },
  joinClassCard: {
    width: '48%',
    height: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinClassContent: {
    alignItems: 'center',
  },
  joinClassText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#176BB7',
    marginTop: 8,
  },
  noClassesText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activityCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: '3.5%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityImageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E4F91',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    height: 40,
  },
  activityButton: {
    backgroundColor: '#B4D4FF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activityButtonText: {
    color: '#1E4F91',
    fontWeight: '600',
    fontSize: 14,
  },
  helpIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
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
});

export default MainLanding;