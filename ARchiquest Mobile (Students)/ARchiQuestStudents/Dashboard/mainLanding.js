import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, 
  Animated, Dimensions, Image, Alert, SafeAreaView, Platform, StatusBar, RefreshControl
  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import CostEstimateSimulator from './CostEstimateSimulator/CostEstimateSimulator';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 768;

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
  const [refreshing, setRefreshing] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;

  const onRefresh = async () => {
  setRefreshing(true);
  await fetchStudentName();
  await fetchActiveClasses();
  setRefreshing(false);
};


  useEffect(() => {
    fetchStudentName();
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
      fetchActiveClasses();
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

  // Mobile layout
  if (isSmallScreen) {
    return (
      <SafeAreaView style={styles.mobileContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#EEF5FF" />
        
        {/* Mobile Header */}
        <View style={styles.mobileHeader}>
          <View style={styles.mobileHeaderLeft}>
            <TouchableOpacity style={styles.mobileProfileButton}>
              <View style={styles.mobileProfileAvatar}>
                <Text style={styles.mobileProfileInitial}>
                  {studentName ? studentName[0] : 'S'}
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.mobileWelcomeText}>
              Welcome, {studentName || 'Student'}
            </Text>
          </View>
          
          <View style={styles.mobileHeaderRight}>
            <TouchableOpacity style={styles.mobileHeaderIcon}>
              <Ionicons name="call-outline" size={20} color="#176BB7" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.mobileHeaderIcon}>
              <Ionicons name="notifications-outline" size={20} color="#176BB7" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mobileMenuButton}
              onPress={() => setIsSideNavVisible(true)}
            >
              <Ionicons name="menu-outline" size={24} color="#176BB7" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Mobile Content */}
        <ScrollView 
          style={styles.mobileContentArea} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.mobileContentContainer}
          refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#176BB7" />
          }
        >
          <Text style={styles.mobileSectionTitle}>Active Classes</Text>
          
          {activeClasses.length > 0 ? (
            activeClasses.map((classItem, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.mobileClassCard}
                onPress={() => handleNavigateToDesignPlan(classItem.id, classItem.class_key)}
              >
                <View style={styles.mobileClassImageContainer}>
                  <View style={[styles.mobileClassImagePlaceholder, { backgroundColor: '#FFE5E5' }]}>
                    <Ionicons name="school-outline" size={30} color="#FF6B6B" />
                  </View>
                </View>
                <View style={styles.mobileClassInfo}>
                  <Text style={styles.mobileClassName}>Class #{classItem.id}</Text>
                  <Text style={styles.mobileClassDescription}>
                    Key: {classItem.class_key}
                  </Text>
                  <Text style={styles.mobileClassDescription}>
                    Joined: {new Date(classItem.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.mobileNoClassesText}>No active classes found</Text>
          )}
          
          <Text style={styles.mobileSectionTitle}>Learning Activities</Text>
          
          <TouchableOpacity 
            style={styles.mobileActivityCard}
            onPress={() => setShowCostEstimator(true)}
          >
            <View style={styles.mobileActivityImageContainer}>
              <View style={[styles.mobileActivityImagePlaceholder, { backgroundColor: '#E0EDFF' }]}>
                <Ionicons name="calculator-outline" size={30} color="#176BB7" />
              </View>
            </View>
            <View style={styles.mobileActivityInfo}>
              <Text style={styles.mobileActivityName}>Cost Estimate Simulator</Text>
              <Text style={styles.mobileActivityDescription} numberOfLines={2}>
                Estimate construction costs and manage project budgets
              </Text>
              <TouchableOpacity 
                style={styles.mobileActivityButton}
                onPress={() => setShowCostEstimator(true)}
              >
                <Text style={styles.mobileActivityButtonText}>START</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mobileActivityCard}>
            <View style={styles.mobileActivityImageContainer}>
              <View style={[styles.mobileActivityImagePlaceholder, { backgroundColor: '#FFE5E5' }]}>
                <Ionicons name="search-outline" size={30} color="#FF6B6B" />
              </View>
            </View>
            <View style={styles.mobileActivityInfo}>
              <Text style={styles.mobileActivityName}>AR Scavenger Hunt</Text>
              <Text style={styles.mobileActivityDescription} numberOfLines={2}>
                Find architectural elements in your environment
              </Text>
              <TouchableOpacity style={styles.mobileActivityButton}>
                <Text style={styles.mobileActivityButtonText}>START</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScrollView>
        
    {/* Mobile Side Navigation */}
{isSideNavVisible && (
  <View
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    }}
  >
    {/* Backdrop */}
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => setIsSideNavVisible(false)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
      }}
    />

    {/* Side Nav Panel */}
        <Animated.View style={[ styles.mobileSideNav,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.mobileSideNavHeader}>
            <TouchableOpacity
              style={styles.mobileSideNavClose}
              onPress={() => setIsSideNavVisible(false)}
            >
              <Ionicons name="close" size={24} color="#176BB7" />
            </TouchableOpacity>
            <Text style={styles.mobileSideNavTitle}>ARchiQuest</Text>
          </View>

          <View style={styles.mobileSideNavContent}>
            <TouchableOpacity style={styles.mobileSideNavItem}
            onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person" size={24} color="#176BB7" />
              <Text style={styles.mobileSideNavText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileSideNavItem}
              onPress={() => navigation.navigate('ReadingMaterials')}
            >
              <Ionicons name="book" size={24} color="#176BB7" />
              <Text style={styles.mobileSideNavText}>Reading Materials</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mobileSideNavItem}
            onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings" size={24} color="#176BB7" />
              <Text style={styles.mobileSideNavText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mobileSideNavItem, styles.mobileSideNavLogout]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={24} color="#FF6B6B" />
              <Text style={styles.mobileSideNavLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    )}

        {/* Mobile Join Class Modal */}
        <Modal
          transparent={true}
          visible={isJoinModalVisible}
          animationType="fade"
          onRequestClose={() => setIsJoinModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Join Class</Text>
              <Text style={styles.modalText}>Enter the class key provided by your teacher</Text>

              <View style={styles.inputContainer}>
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
                  style={styles.modalButton}
                  onPress={handleJoinClass}
                >
                  <Text style={styles.modalButtonText}>Join Class</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setIsJoinModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Help Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeHelpModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Help</Text>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={closeHelpModal}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Desktop layout (original layout)
  return (
    <View style={styles.container}>
      {/* Left Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle} />
        </View>
        
        <View style={styles.sidebarMenu}>
          <TouchableOpacity style={styles.sidebarMenuItem}>
            <Ionicons name="home-outline" size={24} color="#176BB7" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sidebarMenuItem}
          onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={24} color="#176BB7" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sidebarMenuItem} 
            onPress={() => navigation.navigate('ReadingMaterials')}
          >
            <Ionicons name="book-outline" size={24} color="#176BB7" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sidebarMenuItem}>
            <Ionicons name="code-outline" size={24} color="#176BB7" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sidebarMenuItem}
          onPress={() => navigation.navigate('Settings')}>
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
            <Text style={styles.modalTitle}>Help</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={closeHelpModal}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Join Class</Text>
            <Text style={styles.modalText}>Enter the class key provided by your teacher</Text>

            <View style={styles.inputContainer}>
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
                style={styles.modalButton}
                onPress={handleJoinClass}
              >
                <Text style={styles.modalButtonText}>Join Class</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setIsJoinModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Original desktop styles
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
    flex: 1,
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
    marginTop: 'auto',
    backgroundColor: '#FFF0F0',
    marginBottom: 20,
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
    width: '45%',
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
  
  // New mobile styles
  mobileContainer: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  mobileHeader: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mobileHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileMenuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  mobileWelcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#176BB7',
  },
  mobileHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  mobileProfileButton: {
    marginLeft: '2.5%',
    marginRight: '5%',
  },
  mobileProfileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B4D4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileProfileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#176BB7',
  },
  mobileContentArea: {
    flex: 1,
  },
  mobileContentContainer: {
    padding: 15,
    paddingBottom: 80, // Add padding for bottom nav
  },
  mobileSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    marginTop: 5,
  },
  mobileClassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
  },
  mobileClassImageContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  mobileClassImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileClassInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  mobileClassName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E4F91',
    marginBottom: 4,
  },
  mobileClassDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  mobileNoClassesText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  mobileActivityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
  },
  mobileActivityImageContainer: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  mobileActivityImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileActivityInfo: {
    flex: 1,
  },
  mobileActivityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E4F91',
    marginBottom: 4,
  },
  mobileActivityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  mobileActivityButton: {
    backgroundColor: '#B4D4FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  mobileActivityButtonText: {
    color: '#1E4F91',
    fontWeight: '600',
    fontSize: 12,
  },
  mobileBottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  mobileNavItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  mobileAddButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#176BB7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  mobileSideNav: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '55%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 1000,
  },
  mobileSideNavHeader: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mobileSideNavClose: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileSideNavTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#176BB7',
    marginRight: 40,
  },
  mobileSideNavContent: {
    flex: 1,
    paddingTop: 20,
  },
  mobileSideNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  mobileSideNavText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  mobileSideNavLogout: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 20,
  },
  mobileSideNavLogoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 15,
  },
  
  // Improved modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: isSmallScreen ? '90%' : '60%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#176BB7',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
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
  modalButton: {
    backgroundColor: '#176BB7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalCancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MainLanding;