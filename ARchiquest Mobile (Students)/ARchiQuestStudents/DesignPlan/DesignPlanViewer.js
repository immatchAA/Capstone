"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  Animated,
  RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useFocusEffect } from "@react-navigation/native"
import { supabase } from "../supabaseClient"

const { width, height } = Dimensions.get("window")

const DesignPlanViewer = ({ route, navigation }) => {
  const { classId, classKey } = route.params || {}
  const [isLoading, setIsLoading] = useState(true)
  const [classDetails, setClassDetails] = useState(null)
  const [error, setError] = useState(null)
  const [designPlans, setDesignPlans] = useState([])
  const [instructorId, setInstructorId] = useState(null)
  const [userId, setUserId] = useState(null)
  const [studentProgress, setStudentProgress] = useState({})
  const [refreshing, setRefreshing] = useState(false)

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const headerAnim = useRef(new Animated.Value(-100)).current
  const cardAnimations = useRef([]).current

  // Initialize card animations
  const initializeCardAnimations = (count) => {
    cardAnimations.length = 0
    for (let i = 0; i < count; i++) {
      cardAnimations.push({
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
      })
    }
  }

  // Animate cards in sequence
  const animateCards = () => {
    const animations = cardAnimations.map((anim, index) =>
      Animated.parallel([
        Animated.spring(anim.scale, {
          toValue: 1,
          delay: index * 100,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: 1,
          delay: index * 100,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    )

    Animated.stagger(50, animations).start()
  }

  // Initial animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
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

  // Animate cards when design plans are loaded
  useEffect(() => {
    if (designPlans.length > 0 && !isLoading) {
      initializeCardAnimations(designPlans.length)
      setTimeout(() => animateCards(), 300)
    }
  }, [designPlans, isLoading])

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId && designPlans.length > 0) {
        console.log("🔄 Screen focused, refreshing student progress...")
        refreshStudentProgress()
      }
    }, [userId, designPlans]),
  )

  useEffect(() => {
    fetchUserData()
    fetchClassDetails()
  }, [classId])

  useEffect(() => {
    if (instructorId && userId) {
      fetchInstructorDesignPlans()
    }
  }, [instructorId, userId])

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) throw error

      if (user) {
        console.log("👤 Current user ID:", user.id)
        setUserId(user.id)
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }

  const fetchClassDetails = async () => {
    try {
      if (!classId) {
        setError("Class ID is missing")
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("class_keys")
        .select(`
          id,
          class_key,
          class_name,
          class_description,
          teacher_id,
          teachers:teacher_id (
            first_name,
            last_name
          )
        `)
        .eq("id", classId)
        .single()

      if (error) {
        console.error("Error fetching class details:", error)
        setError(`Failed to load class: ${error.message}`)
      } else if (data) {
        setClassDetails(data)
        if (data.teacher_id) {
          setInstructorId(data.teacher_id)
        } else {
          console.log("No teacher_id found for this class")
          setIsLoading(false)
        }
      }
    } catch (err) {
      console.error("Exception in fetchClassDetails:", err)
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  const fetchStudentProgress = async (designPlanIds) => {
    if (!userId || !designPlanIds.length) {
      console.log("⚠️ Cannot fetch progress: missing userId or designPlanIds")
      return
    }

    try {
      console.log("📊 Fetching student progress...")
      console.log("📊 User ID:", userId)
      console.log("📊 Design plan IDs:", designPlanIds)

      const { data, error } = await supabase
        .from("student_progress")
        .select(`
          id,
          student_id,
          design_plan_id,
          class_id,
          progress_step,
          is_completed,
          final_score,
          final_letter_grade,
          completed_at,
          score,
          completion_data
        `)
        .eq("student_id", userId)
        .in("design_plan_id", designPlanIds)

      if (error) {
        console.error("❌ Error fetching student progress:", error)
        return
      }

      console.log("✅ Raw student progress data:", data)

      const progressMap = {}
      if (data && data.length > 0) {
        data.forEach((progress) => {
          progressMap[progress.design_plan_id] = progress
          console.log(`📈 Plan ${progress.design_plan_id}:`, {
            completed: progress.is_completed,
            score: progress.final_score || progress.score,
            grade: progress.final_letter_grade,
          })
        })
      } else {
        console.log("📊 No progress records found for this user")
      }

      setStudentProgress(progressMap)
    } catch (err) {
      console.error("❌ Exception fetching student progress:", err)
    }
  }

  const refreshStudentProgress = async () => {
    if (!userId || designPlans.length === 0) return

    setRefreshing(true)
    const planIds = designPlans.map((plan) => plan.id)
    await fetchStudentProgress(planIds)
    setRefreshing(false)
  }

  const fetchInstructorDesignPlans = async () => {
    try {
      console.log(`🔍 Fetching design plans for instructor: ${instructorId}`)

      const { data, error } = await supabase
        .from("design_plan")
        .select("*")
        .eq("teacher_id", instructorId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error fetching design plans:", error)
        setError("Failed to load instructor design plans")
      } else if (data) {
        console.log(`✅ Found ${data.length} design plans`)
        console.log(
          "🎯 Design plans:",
          data.map((p) => ({ id: p.id, name: p.plan_name })),
        )
        setDesignPlans(data)

        if (data.length > 0) {
          const planIds = data.map((plan) => plan.id)
          await fetchStudentProgress(planIds)
        }
      }
    } catch (err) {
      console.error("❌ Exception fetching design plans:", err)
      setError("Failed to load instructor design plans")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  const handleStartDesign = (designPlan) => {
    console.log("🚀 Opening design plan:", designPlan.id)
    navigation.navigate("DesignPlanDetails", {
      designPlan: designPlan,
      classId: classId,
      classKey: classKey,
    })
  }

  const getCompletionStatus = (planId) => {
    const progress = studentProgress[planId]
    console.log(`🔍 Checking completion for plan ${planId}:`, progress)

    if (!progress) {
      return { isCompleted: false, status: "not_started" }
    }

    if (progress.is_completed) {
      return {
        isCompleted: true,
        status: "completed",
        score: progress.final_score || progress.score,
        grade: progress.final_letter_grade,
        completedAt: progress.completed_at,
      }
    }

    return {
      isCompleted: false,
      status: "in_progress",
      progressStep: progress.progress_step,
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return ["#10B981", "#34D399"]
      case "in_progress":
        return ["#F59E0B", "#FBBF24"]
      default:
        return ["#6B7280", "#9CA3AF"]
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "checkmark-circle"
      case "in_progress":
        return "time"
      default:
        return "play-circle-outline"
    }
  }

  const renderCompletionBadge = (planId) => {
    const completion = getCompletionStatus(planId)
    const colors = getStatusColor(completion.status)
    const icon = getStatusIcon(completion.status)

    return (
      <LinearGradient colors={colors} style={styles.completionBadge}>
        <Ionicons name={icon} size={14} color="#FFFFFF" />
        <Text style={styles.completionText}>
          {completion.status === "completed"
            ? `Completed ${completion.grade ? `(${completion.grade})` : ""}`
            : completion.status === "in_progress"
              ? "In Progress"
              : "Not Started"}
        </Text>
      </LinearGradient>
    )
  }

  const PlanCard = ({ plan, index }) => {
    const completion = getCompletionStatus(plan.id)
    const cardAnim = cardAnimations[index] || { scale: new Animated.Value(1), opacity: new Animated.Value(1) }
    const pressAnim = useRef(new Animated.Value(1)).current

    const handlePressIn = () => {
      Animated.spring(pressAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start()
    }

    const handlePressOut = () => {
      Animated.spring(pressAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }

    return (
      <Animated.View
        style={[
          styles.planCard,
          {
            opacity: cardAnim.opacity,
            transform: [{ scale: Animated.multiply(cardAnim.scale, pressAnim) }],
          },
        ]}
      >
        <LinearGradient
          colors={completion.isCompleted ? ["#F0FDF4", "#DCFCE7"] : ["#FFFFFF", "#F8FAFC"]}
          style={styles.planCardGradient}
        >
          <View style={styles.planCardHeader}>
            <LinearGradient
              colors={getStatusColor(completion.status)}
              style={styles.planIconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={getStatusIcon(completion.status)} size={24} color="#FFFFFF" />
            </LinearGradient>

            <View style={styles.planHeaderInfo}>
              <Text style={styles.planTitle}>{plan.plan_name || `Design Plan ${index + 1}`}</Text>
              {renderCompletionBadge(plan.id)}
            </View>
          </View>

          <Text style={styles.planDescription} numberOfLines={3}>
            {plan.description || "No description available"}
          </Text>

          {completion.isCompleted && (
            <View style={styles.completionDetails}>
              {completion.completedAt && (
                <View style={styles.completionDetailItem}>
                  <Ionicons name="calendar-outline" size={14} color="#10B981" />
                  <Text style={styles.completionDetailText}>
                    {new Date(completion.completedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {completion.score && (
                <View style={styles.completionDetailItem}>
                  <Ionicons name="trophy-outline" size={14} color="#10B981" />
                  <Text style={styles.completionDetailText}>Score: {completion.score}/100</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.planButton}
            onPress={() => handleStartDesign(plan)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={completion.isCompleted ? ["#10B981", "#34D399"] : ["#4F46E5", "#7C3AED"]}
              style={styles.planButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.planButtonText}>{completion.isCompleted ? "Review" : "Start"}</Text>
              <Ionicons
                name={completion.isCompleted ? "eye" : "play"}
                size={16}
                color="#FFFFFF"
                style={{ marginLeft: 6 }}
              />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.loadingGradient}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading design plans...</Text>
            <View style={styles.loadingDots}>
              <View style={[styles.loadingDot, { animationDelay: "0s" }]} />
              <View style={[styles.loadingDot, { animationDelay: "0.2s" }]} />
              <View style={[styles.loadingDot, { animationDelay: "0.4s" }]} />
            </View>
          </View>
        </LinearGradient>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <Animated.View style={[styles.headerContainer, { transform: [{ translateY: headerAnim }] }]}>
        <LinearGradient
          colors={["#4F46E5", "#7C3AED"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <LinearGradient colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]} style={styles.backButtonBg}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Design Plans</Text>
            {refreshing && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 8 }} />}
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshStudentProgress}
              colors={["#4F46E5"]}
              tintColor="#4F46E5"
            />
          }
        >
          {/* Enhanced Class Banner */}
          <View style={styles.bannerContainer}>
            <ImageBackground
              source={{
                uri: "https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2429&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              }}
              style={styles.classBanner}
              imageStyle={styles.classBannerImage}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
                style={styles.bannerOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <View style={styles.bannerContent}>
                  <Text style={styles.className}>{classDetails?.class_name || `Class #${classId}`}</Text>
                  <View style={styles.classKeyContainer}>
                    <Ionicons name="key" size={16} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.classKey}>Class Key: {classKey}</Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>

          {/* Enhanced Class Info */}
          <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.classInfoCard}>
            {classDetails?.teachers && (
              <View style={styles.instructorContainer}>
                <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.instructorIcon}>
                  <Ionicons name="school" size={20} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.instructorInfo}>
                  <Text style={styles.instructorLabel}>Instructor</Text>
                  <Text style={styles.teacherName}>
                    {classDetails.teachers.first_name} {classDetails.teachers.last_name}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.classDescription}>
              {classDetails?.class_description ||
                "Work on design plans created by your instructor to enhance your understanding of architectural and construction concepts."}
            </Text>
          </LinearGradient>

          {/* Enhanced Design Plans Section */}
          <View style={styles.designPlanContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <LinearGradient colors={["#4F46E5", "#7C3AED"]} style={styles.sectionIcon}>
                  <Ionicons name="document-text" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.sectionTitle}>Design Plans</Text>
              </View>
              <TouchableOpacity style={styles.refreshButton} onPress={refreshStudentProgress} disabled={refreshing}>
                <LinearGradient
                  colors={refreshing ? ["#E5E7EB", "#F3F4F6"] : ["#4F46E5", "#7C3AED"]}
                  style={styles.refreshButtonGradient}
                >
                  <Ionicons name="refresh" size={18} color={refreshing ? "#9CA3AF" : "#FFFFFF"} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {designPlans.length > 0 ? (
              <View style={styles.plansGrid}>
                {designPlans.map((plan, index) => (
                  <PlanCard key={plan.id || index} plan={plan} index={index} />
                ))}
              </View>
            ) : (
              <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.emptyState}>
                <View style={styles.emptyStateContent}>
                  <LinearGradient colors={["#E5E7EB", "#F3F4F6"]} style={styles.emptyStateIcon}>
                    <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                  </LinearGradient>
                  <Text style={styles.emptyStateTitle}>No Design Plans Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Your instructor hasn't created any design plans for this class yet. Check back later!
                  </Text>
                </View>
              </LinearGradient>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#64748B",
    marginTop: 16,
    fontWeight: "500",
  },
  loadingDots: {
    flexDirection: "row",
    marginTop: 20,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4F46E5",
    marginHorizontal: 4,
    opacity: 0.3,
  },
  headerContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  classBanner: {
    height: 200,
    justifyContent: "flex-end",
  },
  classBannerImage: {
    borderRadius: 16,
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bannerContent: {
    padding: 20,
  },
  className: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  classKeyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  classKey: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginLeft: 6,
    fontWeight: "500",
  },
  classInfoCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  instructorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  instructorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 2,
  },
  classDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: "#64748B",
  },
  designPlanContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
  },
  refreshButton: {
    borderRadius: 20,
  },
  refreshButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  plansGrid: {
    gap: 16,
  },
  planCard: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  planCardGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  planCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  planIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  planHeaderInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  completionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  completionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 16,
  },
  completionDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 12,
  },
  completionDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  completionDetailText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "500",
    marginLeft: 4,
  },
  planButton: {
    borderRadius: 12,
  },
  planButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  planButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyStateContent: {
    alignItems: "center",
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
})

export default DesignPlanViewer
