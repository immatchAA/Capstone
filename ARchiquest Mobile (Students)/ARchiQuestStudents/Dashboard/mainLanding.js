
"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { supabase } from "../supabaseClient"
import CostEstimateSimulator from "./CostEstimateSimulator/CostEstimateSimulator"

const { width, height } = Dimensions.get("window")
const isSmallScreen = width < 768

const MainLanding = () => {
  const navigation = useNavigation()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [isSideNavVisible, setIsSideNavVisible] = useState(false)
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false)
  const [classKey, setClassKey] = useState("")
  const [showCostEstimator, setShowCostEstimator] = useState(false)
  const [studentName, setStudentName] = useState("")
  const [activeClasses, setActiveClasses] = useState([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const screenWidth = Dimensions.get("window").width
  const slideAnim = useRef(new Animated.Value(screenWidth)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current
  const headerAnim = useRef(new Animated.Value(-100)).current


  const onRefresh = async () => {
  setRefreshing(true);
  await fetchStudentName();
  await fetchActiveClasses();
  setRefreshing(false);
};


  useEffect(() => {
    fetchStudentName()
    fetchActiveClasses()

    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(headerAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  useEffect(() => {
    if (isSideNavVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [isSideNavVisible])

  const fetchStudentName = async () => {
    try {
      setIsLoading(true)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Unable to fetch user")
        return
      }

      const { data, error } = await supabase.from("users").select("first_name").eq("id", user.id).single()

      if (error) {
        console.error("Error fetching student name:", error)
        return
      }

      if (data && data.first_name) {
        setStudentName(data.first_name)
      }
    } catch (err) {
      console.error("Error in fetchStudentName:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActiveClasses = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Unable to fetch user")
        return
      }

      const { data, error } = await supabase
        .from("class_students")
        .select(`
          class_id,
          class_keys:class_id (
            id,
            class_key,
            teacher_id,
            created_at
          )
        `)
        .eq("student_id", user.id)

      if (error) {
        console.error("Error fetching classes:", error)
        return
      }

      if (data) {
        const classes = data.map((item) => item.class_keys)
        setActiveClasses(classes)
      }
    } catch (err) {
      console.error("Error in fetchActiveClasses:", err)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchStudentName(), fetchActiveClasses()])
    setRefreshing(false)
  }

  const openHelpModalWithMessage = (message) => {
    setModalMessage(message)
    setIsModalVisible(true)
  }

  const closeHelpModal = () => setIsModalVisible(false)

  const handleJoinClass = async () => {
    if (!classKey.trim()) {
      Alert.alert("Error", "Please enter a class key")
      return
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        Alert.alert("Error", "Unable to fetch user. Please log in.")
        return
      }

      const studentId = user.id

      const { data: classData, error: classError } = await supabase
        .from("class_keys")
        .select("id")
        .eq("class_key", classKey.trim())
        .single()

      if (classError || !classData) {
        Alert.alert("Error", "Class key not found.")
        return
      }

      const classId = classData.id

      const { error: insertError } = await supabase.from("class_students").insert([
        {
          class_id: classId,
          student_id: studentId,
          joined_at: new Date().toISOString(),
        },
      ])

      if (insertError) {
        Alert.alert("Error", "Failed to join class: " + insertError.message)
        return
      }

      Alert.alert("Success", "✅ Successfully joined the class!")
      setIsJoinModalVisible(false)
      setClassKey("")
      fetchActiveClasses()
    } catch (err) {
      Alert.alert("Error", "An error occurred: " + err.message)
    }
  }

  const handleNavigateToDesignPlan = (classId, classKey) => {
    if (navigation) {
      navigation.navigate("DesignPlanViewer", {
        classId: classId,
        classKey: classKey,
      })
    } else {
      console.error("Navigation is not available")
    }
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            setIsLoggingOut(true)
            const { error } = await supabase.auth.signOut()

            if (error) {
              console.error("Error signing out:", error)
              Alert.alert("Error", "Failed to logout. Please try again.")
            } else {
              if (navigation) {
                try {
                  navigation.navigate("UserLogin")
                } catch (navError) {
                  console.log("Could not navigate to Login, trying Auth")
                  try {
                    navigation.navigate("Auth")
                  } catch (navError2) {
                    console.log("Could not navigate to Auth, trying SignIn")
                    try {
                      navigation.navigate("SignIn")
                    } catch (navError3) {
                      console.log("Could not navigate to SignIn, trying Welcome")
                      try {
                        navigation.navigate("Welcome")
                      } catch (navError4) {
                        console.error("Navigation failed:", navError4)
                        Alert.alert("Logout Successful", "Please restart the app to sign in again.")
                      }
                    }
                  }
                }
              } else {
                Alert.alert("Logout Successful", "Please restart the app to sign in again.")
              }
            }
          } catch (err) {
            console.error("Error in handleLogout:", err)
            Alert.alert("Error", "An unexpected error occurred. Please try again.")
          } finally {
            setIsLoggingOut(false)
          }
        },
      },
    ])
  }

  // Enhanced Class Card Component
  const ClassCard = ({ classItem, index }) => {
    const cardScale = useRef(new Animated.Value(0)).current
    const cardFade = useRef(new Animated.Value(0)).current

    useEffect(() => {
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          delay: index * 100,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(cardFade, {
          toValue: 1,
          delay: index * 100,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start()
    }, [])

    const handlePressIn = () => {
      Animated.spring(cardScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start()
    }

    const handlePressOut = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    const gradientColors = [
      ["#FF6B6B", "#FF8E8E"],
      ["#4ECDC4", "#44A08D"],
      ["#45B7D1", "#96C93D"],
      ["#F093FB", "#F5576C"],
      ["#4FACFE", "#00F2FE"],
    ]

    const cardGradient = gradientColors[index % gradientColors.length]

    return (
      <Animated.View
        style={[
          isSmallScreen ? styles.mobileClassCard : styles.classCard,
          {
            opacity: cardFade,
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleNavigateToDesignPlan(classItem.id, classItem.class_key)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={styles.classCardTouchable}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={isSmallScreen ? styles.mobileClassCardContent : styles.classCardContent}
          >
            <LinearGradient
              colors={cardGradient}
              style={isSmallScreen ? styles.mobileClassIconContainer : styles.classIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="school" size={isSmallScreen ? 24 : 32} color="#FFFFFF" />
            </LinearGradient>

            <View style={isSmallScreen ? styles.mobileClassInfo : styles.classInfo}>
              <Text style={isSmallScreen ? styles.mobileClassName : styles.className}>Class #{classItem.id}</Text>
              <Text style={isSmallScreen ? styles.mobileClassDescription : styles.classDescription}>
                Key: {classItem.class_key}
              </Text>
              <Text style={isSmallScreen ? styles.mobileClassDescription : styles.classDescription}>
                Joined: {new Date(classItem.created_at).toLocaleDateString()}
              </Text>
            </View>

            {!isSmallScreen && (
              <TouchableOpacity style={styles.classMoreButton}>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  // Enhanced Activity Card Component
  const ActivityCard = ({ title, description, icon, gradientColors, index, onPress, onHelpPress }) => {
    const activityScale = useRef(new Animated.Value(0)).current
    const activityFade = useRef(new Animated.Value(0)).current

    useEffect(() => {
      Animated.parallel([
        Animated.spring(activityScale, {
          toValue: 1,
          delay: index * 150,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(activityFade, {
          toValue: 1,
          delay: index * 150,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start()
    }, [])

    const handlePressIn = () => {
      Animated.spring(activityScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start()
    }

    const handlePressOut = () => {
      Animated.spring(activityScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    return (
      <Animated.View
        style={[
          styles.activityCard,
          {
            opacity: activityFade,
            transform: [{ scale: activityScale }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={styles.activityCardTouchable}
        >
          <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.activityCardContent}>
            <TouchableOpacity style={styles.helpButton} onPress={onHelpPress}>
              <Ionicons name="help-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <LinearGradient
              colors={gradientColors}
              style={styles.activityIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={icon} size={32} color="#FFFFFF" />
            </LinearGradient>

            <Text style={styles.activityName}>{title}</Text>
            <Text style={styles.activityDescription}>{description}</Text>

            <TouchableOpacity style={styles.startButton}>
              <LinearGradient
                colors={["#4F46E5", "#7C3AED"]}
                style={styles.startButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startButtonText}>START</Text>
                <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginLeft: 5 }} />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  // Loading Skeleton Component
  const SkeletonCard = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ]),
      )
      shimmer.start()
      return () => shimmer.stop()
    }, [])

    const backgroundColor = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["#F1F5F9", "#E2E8F0"],
    })

    return (
      <View style={isSmallScreen ? styles.mobileClassCard : styles.classCard}>
        <View style={styles.skeletonContent}>
          <Animated.View style={[styles.skeletonIcon, { backgroundColor }]} />
          <View style={styles.skeletonText}>
            <Animated.View style={[styles.skeletonLine, { backgroundColor, width: "60%" }]} />
            <Animated.View style={[styles.skeletonLine, { backgroundColor, width: "80%" }]} />
            <Animated.View style={[styles.skeletonLine, { backgroundColor, width: "40%" }]} />
          </View>
        </View>
      </View>
    )
  }

  if (showCostEstimator) {
    return <CostEstimateSimulator onBack={() => setShowCostEstimator(false)} />
  }

  // Mobile layout
  if (isSmallScreen) {
    return (
      <SafeAreaView style={styles.mobileContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

        {/* Enhanced Mobile Header */}
        <Animated.View style={[styles.mobileHeaderContainer, { transform: [{ translateY: headerAnim }] }]}>
          <LinearGradient
            colors={["#4F46E5", "#7C3AED"]}
            style={styles.mobileHeaderGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.mobileHeader}>
              <View style={styles.mobileHeaderLeft}>
                <TouchableOpacity style={styles.mobileProfileButton}>
                  <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.mobileProfileAvatar}>
                    <Text style={styles.mobileProfileInitial}>{studentName ? studentName[0].toUpperCase() : "S"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={styles.mobileWelcomeSection}>
                  <Text style={styles.mobileWelcomeLabel}>Welcome back,</Text>
                  <Text style={styles.mobileWelcomeText}>{studentName || "Student"}</Text>
                </View>
              </View>

              <View style={styles.mobileHeaderRight}>
                <TouchableOpacity style={styles.mobileHeaderIcon}>
                  <Ionicons name="notifications" size={20} color="rgba(255, 255, 255, 0.9)" />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>


                <TouchableOpacity style={styles.mobileMenuButton} onPress={() => setIsSideNavVisible(true)}>
                  <Ionicons name="menu" size={24} color="rgba(255, 255, 255, 0.9)" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Mobile Content */}
        <Animated.View style={[styles.mobileContentWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <ScrollView
            style={styles.mobileContentArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mobileContentContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} tintColor="#4F46E5" />
            }
          >
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}

              >
                <Ionicons name="school" size={20} color="#FFFFFF" />
                <Text style={styles.statNumber}>{activeClasses.length}</Text>
                <Text style={styles.statLabel}>Classes</Text>
              </LinearGradient>

              <LinearGradient
                colors={["#f093fb", "#f5576c"]}
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="trophy" size={20} color="#FFFFFF" />
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </LinearGradient>

              <LinearGradient
                colors={["#4facfe", "#00f2fe"]}
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="time" size={20} color="#FFFFFF" />
                <Text style={styles.statNumber}>24h</Text>
                <Text style={styles.statLabel}>Study Time</Text>
              </LinearGradient>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.mobileSectionTitle}>Active Classes</Text>
              <TouchableOpacity style={styles.addClassButton} onPress={() => setIsJoinModalVisible(true)}>
                <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.addClassButtonGradient}>
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>

            </View>

            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : activeClasses.length > 0 ? (
              activeClasses.map((classItem, index) => <ClassCard key={index} classItem={classItem} index={index} />)
            ) : (
              <View style={styles.emptyState}>
                <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.emptyStateContent}>
                  <Ionicons name="school-outline" size={48} color="#94A3B8" />
                  <Text style={styles.emptyStateText}>No active classes yet</Text>
                  <TouchableOpacity style={styles.emptyStateButton} onPress={() => setIsJoinModalVisible(true)}>
                    <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.emptyStateButtonGradient}>
                      <Text style={styles.emptyStateButtonText}>Join Your First Class</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}

            <Text style={styles.mobileSectionTitle}>Learning Activities</Text>

            <View style={styles.activitiesGrid}>
              <ActivityCard
                title="Cost Estimate Simulator"
                description="Estimate construction costs and manage project budgets"
                icon="calculator"
                gradientColors={["#667eea", "#764ba2"]}
                index={0}
                onPress={() => setShowCostEstimator(true)}
                onHelpPress={() =>
                  openHelpModalWithMessage(
                    `📘 How to Play\n\n1️⃣ Select materials and components from the catalog.\n\n2️⃣ Estimate quantities and calculate costs for your project.\n\n3️⃣ Balance your budget while meeting all project requirements.`,
                  )
                }
              />

              <ActivityCard
                title="AR Scavenger Hunt"
                description="Find architectural elements in your environment"
                icon="search"
                gradientColors={["#f093fb", "#f5576c"]}
                index={1}
                onPress={() => Alert.alert("Coming Soon", "AR Scavenger Hunt will be available soon!")}
                onHelpPress={() =>
                  openHelpModalWithMessage(
                    `📘 How to Play\n\n1️⃣ Point your camera at architectural elements in your environment.\n\n2️⃣ The app will identify elements and provide information about them.\n\n3️⃣ Complete challenges by finding specific architectural features.`,
                  )
                }
              />

              <ActivityCard
                title="Design Challenge"
                description="Create and share your architectural designs"
                icon="construct"
                gradientColors={["#4facfe", "#00f2fe"]}
                index={2}
                onPress={() => Alert.alert("Coming Soon", "Design Challenge will be available soon!")}
                onHelpPress={() => openHelpModalWithMessage("This feature is coming soon!")}
              />

              <ActivityCard
                title="Virtual Tours"
                description="Explore famous buildings around the world"
                icon="globe"
                gradientColors={["#43e97b", "#38f9d7"]}
                index={3}
                onPress={() => Alert.alert("Coming Soon", "Virtual Tours will be available soon!")}
                onHelpPress={() => openHelpModalWithMessage("This feature is coming soon!")}
              />
            </View>
          </ScrollView>
        </Animated.View>

        {/* Enhanced Mobile Bottom Navigation */}
        <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.mobileBottomNav}>
          <TouchableOpacity style={styles.mobileNavItem}>
            <Ionicons name="home" size={24} color="#4F46E5" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mobileNavItem}>
            <Ionicons name="person-outline" size={24} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mobileAddButton} onPress={() => setIsJoinModalVisible(true)}>
            <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.mobileAddButtonGradient}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mobileNavItem} onPress={() => navigation.navigate("ReadingMaterials")}>
            <Ionicons name="book-outline" size={24} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mobileNavItem}>
            <Ionicons name="settings-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Enhanced Mobile Side Navigation */}
        {isSideNavVisible && (
          <View style={styles.sideNavOverlay}>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setIsSideNavVisible(false)}
              style={styles.sideNavBackdrop}
            />


            <Animated.View style={[styles.mobileSideNav, { transform: [{ translateX: slideAnim }] }]}>
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.mobileSideNavHeader}>
                <TouchableOpacity style={styles.mobileSideNavClose} onPress={() => setIsSideNavVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.mobileSideNavTitle}>ARchiQuest</Text>
              </LinearGradient>


              <View style={styles.mobileSideNavContent}>
                <TouchableOpacity style={styles.mobileSideNavItem}>
                  <Ionicons name="person" size={24} color="#4F46E5" />
                  <Text style={styles.mobileSideNavText}>Profile</Text>
                </TouchableOpacity>


                <TouchableOpacity
                  style={styles.mobileSideNavItem}
                  onPress={() => navigation.navigate("ReadingMaterials")}
                >
                  <Ionicons name="book" size={24} color="#4F46E5" />
                  <Text style={styles.mobileSideNavText}>Reading Materials</Text>
                </TouchableOpacity>



                <TouchableOpacity style={styles.mobileSideNavItem}>
                  <Ionicons name="settings" size={24} color="#4F46E5" />
                  <Text style={styles.mobileSideNavText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.mobileSideNavItem, styles.mobileSideNavLogout]} onPress={handleLogout}>
                  <Ionicons name="log-out" size={24} color="#EF4444" />
                  <Text style={styles.mobileSideNavLogoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}

        {/* Enhanced Modals */}
        <Modal
          transparent={true}
          visible={isJoinModalVisible}
          animationType="fade"
          onRequestClose={() => setIsJoinModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Join Class</Text>
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={styles.modalText}>Enter the class key provided by your teacher</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter class key"
                    value={classKey}
                    onChangeText={setClassKey}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setIsJoinModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.joinButton} onPress={handleJoinClass}>
                    <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.joinButtonGradient}>
                      <Text style={styles.joinButtonText}>Join Class</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={closeHelpModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Help</Text>
              </LinearGradient>

              <View style={styles.modalBody}>
                <Text style={styles.modalText}>{modalMessage}</Text>
                <TouchableOpacity style={styles.helpCloseButton} onPress={closeHelpModal}>
                  <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.helpCloseButtonGradient}>
                    <Text style={styles.helpCloseButtonText}>Close</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    )
  }

  // Enhanced Desktop layout
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Enhanced Left Sidebar */}
      <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.sidebar}>
        <View style={styles.logoContainer}>
          <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.logoCircle}>
            <Ionicons name="school" size={20} color="#FFFFFF" />
          </LinearGradient>
        </View>

        <View style={styles.sidebarMenu}>
          <TouchableOpacity style={[styles.sidebarMenuItem, styles.activeMenuItem]}>
            <Ionicons name="home" size={24} color="#4F46E5" />
          </TouchableOpacity>


          <TouchableOpacity style={styles.sidebarMenuItem}>
            <Ionicons name="person-outline" size={24} color="#64748B" />

          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => navigation.navigate("ReadingMaterials")}>
            <Ionicons name="book-outline" size={24} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarMenuItem}>
            <Ionicons name="code-outline" size={24} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sidebarMenuItem}>
            <Ionicons name="settings-outline" size={24} color="#64748B" />


          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarMenuItem, styles.logoutButton]}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Enhanced Main Content */}
      <View style={styles.mainContent}>
        {/* Enhanced Header */}
        <Animated.View style={[styles.headerContainer, { transform: [{ translateY: headerAnim }] }]}>
          <LinearGradient
            colors={["#4F46E5", "#7C3AED"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.welcomeSection}>
                  <Text style={styles.welcomeLabel}>Welcome back,</Text>
                  <Text style={styles.welcomeText}>{studentName || "Student"}</Text>
                </View>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.headerIcon}>
                  <Ionicons name="notifications" size={20} color="rgba(255, 255, 255, 0.9)" />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() => {
                    Alert.alert("Profile Options", "Select an option", [
                      {
                        text: "View Profile",
                        onPress: () => console.log("View Profile pressed"),
                      },
                      {
                        text: "Logout",
                        onPress: handleLogout,
                        style: "destructive",
                      },
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                    ])
                  }}
                >
                  <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.profileAvatar}>
                    <Text style={styles.profileInitial}>{studentName ? studentName[0].toUpperCase() : "S"}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.studentBadge}>
                  <LinearGradient colors={["#10B981", "#34D399"]} style={styles.studentBadgeGradient}>
                    <Text style={styles.studentBadgeText}>STUDENT</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Content Area */}
        <Animated.View style={[styles.contentWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <ScrollView
            style={styles.contentArea}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} tintColor="#4F46E5" />
            }
          >
            {/* Quick Stats */}
            <View style={styles.desktopStatsContainer}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.desktopStatCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="school" size={24} color="#FFFFFF" />
                <Text style={styles.desktopStatNumber}>{activeClasses.length}</Text>
                <Text style={styles.desktopStatLabel}>Active Classes</Text>
              </LinearGradient>

              <LinearGradient
                colors={["#f093fb", "#f5576c"]}
                style={styles.desktopStatCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="trophy" size={24} color="#FFFFFF" />
                <Text style={styles.desktopStatNumber}>12</Text>
                <Text style={styles.desktopStatLabel}>Achievements</Text>
              </LinearGradient>

              <LinearGradient
                colors={["#4facfe", "#00f2fe"]}
                style={styles.desktopStatCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="time" size={24} color="#FFFFFF" />
                <Text style={styles.desktopStatNumber}>24h</Text>
                <Text style={styles.desktopStatLabel}>Study Time</Text>
              </LinearGradient>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Classes</Text>
              <TouchableOpacity style={styles.addClassButton} onPress={() => setIsJoinModalVisible(true)}>
                <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.addClassButtonGradient}>
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.classesGrid}>
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : activeClasses.length > 0 ? (
                activeClasses.map((classItem, index) => <ClassCard key={index} classItem={classItem} index={index} />)
              ) : (
                <View style={styles.emptyState}>
                  <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.emptyStateContent}>
                    <Ionicons name="school-outline" size={64} color="#94A3B8" />
                    <Text style={styles.emptyStateText}>No active classes yet</Text>
                    <TouchableOpacity style={styles.emptyStateButton} onPress={() => setIsJoinModalVisible(true)}>
                      <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.emptyStateButtonGradient}>
                        <Text style={styles.emptyStateButtonText}>Join Your First Class</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              )}

              {/* Enhanced Join Class Card */}
              <TouchableOpacity style={styles.joinClassCard} onPress={() => setIsJoinModalVisible(true)}>
                <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.joinClassContent}>
                  <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.joinClassIcon}>
                    <Ionicons name="add-circle" size={32} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.joinClassText}>Join class</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Learning Activities</Text>

            <View style={styles.activitiesGrid}>
              <ActivityCard
                title="Cost Estimate Simulator"
                description="Estimate construction costs and manage project budgets"
                icon="calculator"
                gradientColors={["#667eea", "#764ba2"]}
                index={0}
                onPress={() => setShowCostEstimator(true)}
                onHelpPress={() =>
                  openHelpModalWithMessage(
                    `📘 How to Play\n\n1️⃣ Select materials and components from the catalog.\n\n2️⃣ Estimate quantities and calculate costs for your project.\n\n3️⃣ Balance your budget while meeting all project requirements.`,
                  )
                }
              />

              <ActivityCard
                title="AR Scavenger Hunt"
                description="Find architectural elements in your environment"
                icon="search"
                gradientColors={["#f093fb", "#f5576c"]}
                index={1}
                onPress={() => Alert.alert("Coming Soon", "AR Scavenger Hunt will be available soon!")}
                onHelpPress={() =>
                  openHelpModalWithMessage(
                    `📘 How to Play\n\n1️⃣ Point your camera at architectural elements in your environment.\n\n2️⃣ The app will identify elements and provide information about them.\n\n3️⃣ Complete challenges by finding specific architectural features.`,
                  )
                }
              />

              <ActivityCard
                title="Design Challenge"
                description="Create and share your architectural designs"
                icon="construct"
                gradientColors={["#4facfe", "#00f2fe"]}
                index={2}
                onPress={() => Alert.alert("Coming Soon", "Design Challenge will be available soon!")}
                onHelpPress={() => openHelpModalWithMessage("This feature is coming soon!")}
              />

              <ActivityCard
                title="Virtual Tours"
                description="Explore famous buildings around the world"
                icon="globe"
                gradientColors={["#43e97b", "#38f9d7"]}
                index={3}
                onPress={() => Alert.alert("Coming Soon", "Virtual Tours will be available soon!")}
                onHelpPress={() => openHelpModalWithMessage("This feature is coming soon!")}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </View>

      {/* Enhanced Desktop Modals */}
      <Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={closeHelpModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help</Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <TouchableOpacity style={styles.helpCloseButton} onPress={closeHelpModal}>
                <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.helpCloseButtonGradient}>
                  <Text style={styles.helpCloseButtonText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={isJoinModalVisible}
        animationType="fade"
        onRequestClose={() => setIsJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Class</Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>Enter the class key provided by your teacher</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter class key"
                  value={classKey}
                  onChangeText={setClassKey}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsJoinModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.joinButton} onPress={handleJoinClass}>
                  <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.joinButtonGradient}>
                    <Text style={styles.joinButtonText}>Join Class</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  // Base container styles
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
  },

  // Enhanced sidebar styles
  sidebar: {
    width: 70,
    paddingVertical: 20,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sidebarMenu: {
    alignItems: "center",
    flex: 1,
  },
  sidebarMenuItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  activeMenuItem: {
    backgroundColor: "#EEF2FF",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    marginTop: "auto",
    backgroundColor: "#FEF2F2",
    marginBottom: 20,
  },

  // Enhanced main content styles
  mainContent: {
    flex: 1,
  },
  headerContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  profileButton: {
    marginLeft: 15,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  studentBadge: {
    marginLeft: 15,
  },
  studentBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  studentBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },

  // Enhanced content area styles
  contentWrapper: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    padding: 20,
  },

  // Stats container styles
  desktopStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  desktopStatCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  desktopStatNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
  },
  desktopStatLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
  },

  // Section styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  addClassButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  addClassButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Enhanced class card styles
  classesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 30,
  },
  classCard: {
    width: "48%",
    marginRight: "4%",
    marginBottom: 20,
  },
  classCardTouchable: {
    borderRadius: 16,
  },
  classCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  classIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  classDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  classMoreButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  // Join class card styles
  joinClassCard: {
    width: "48%",
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  joinClassContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  joinClassIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  joinClassText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
  },

  // Empty state styles
  emptyState: {
    width: "100%",
    marginBottom: 20,
  },
  emptyStateContent: {
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyStateText: {
    fontSize: 18,
    color: "#64748B",
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyStateButton: {
    borderRadius: 25,
  },
  emptyStateButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Enhanced activity card styles
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityCard: {
    width: isSmallScreen ? (width - 45) / 2 : "48%",
    marginBottom: 20,
  },
  activityCardTouchable: {
    borderRadius: 20,
  },
  activityCardContent: {
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    minHeight: 220,
  },
  helpButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  activityIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    alignSelf: "center",
  },
  activityName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  activityDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
    flex: 1,
  },
  startButton: {
    borderRadius: 25,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },

  // Skeleton loader styles
  skeletonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  skeletonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  skeletonText: {
    flex: 1,
  },
  skeletonLine: {
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },

  // Mobile specific styles
  mobileContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  mobileHeaderContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mobileHeaderGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    paddingBottom: 20,
  },
  mobileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  mobileHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mobileProfileButton: {
    marginRight: 15,
  },
  mobileProfileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mobileProfileInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  mobileWelcomeSection: {
    flex: 1,
  },
  mobileWelcomeLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
  },
  mobileWelcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 2,
  },
  mobileHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  mobileHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  mobileMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  // Mobile content styles
  mobileContentWrapper: {
    flex: 1,
  },
  mobileContentArea: {
    flex: 1,
  },
  mobileContentContainer: {
    padding: 20,
    paddingBottom: 100,
  },

  // Mobile stats styles
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },

  // Mobile section styles
  mobileSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 15,
  },

  // Mobile class card styles
  mobileClassCard: {
    marginBottom: 15,
  },
  mobileClassCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  mobileClassIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  mobileClassInfo: {
    flex: 1,
  },
  mobileClassName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 3,
  },
  mobileClassDescription: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 1,
  },
  mobileNoClassesText: {
    fontSize: 16,
    color: "#64748B",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 20,
  },

  // Mobile bottom navigation styles
  mobileBottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  mobileNavItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  mobileAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 20,
  },
  mobileAddButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Mobile side navigation styles
  sideNavOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  sideNavBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  mobileSideNav: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "75%",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 15,
  },
  mobileSideNavHeader: {
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 25,
  },
  mobileSideNavClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  mobileSideNavTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  mobileSideNavContent: {
    flex: 1,
    paddingTop: 30,
  },
  mobileSideNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  mobileSideNavText: {
    fontSize: 16,
    color: "#1E293B",
    marginLeft: 15,
    fontWeight: "500",
  },
  mobileSideNavLogout: {
    marginTop: "auto",
    borderTopWidth: 2,
    borderTopColor: "#F1F5F9",
    borderBottomWidth: 0,
    paddingVertical: 25,
  },
  mobileSideNavLogoutText: {
    fontSize: 16,
    color: "#EF4444",
    marginLeft: 15,
    fontWeight: "600",
  },

  // Enhanced modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: isSmallScreen ? "90%" : "70%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalBody: {
    padding: 25,
  },
  modalText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 25,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 16,
  },
  joinButton: {
    flex: 1,
    borderRadius: 12,
    marginLeft: 10,
  },
  joinButtonGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  helpCloseButton: {
    borderRadius: 12,
    alignSelf: "center",
    minWidth: 120,
  },
  helpCloseButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  helpCloseButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
})

export default MainLanding
