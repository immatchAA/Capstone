"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Linking,
  Alert,
  FlatList,
  Modal,
  Animated,
  Dimensions,
  TextInput,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../supabaseClient"

//Zoom and Pan image
import ImageViewing from "react-native-image-viewing"

// Enhanced Educational Rubrics System
const EDUCATIONAL_RUBRICS = {
  budgetManagement: {
    name: "Budget Management",
    maxScore: 25,
    criteria: [
      {
        level: "Excellent",
        scoreRange: [23, 25],
        description: "Stays 10-15% under budget with strategic cost allocation",
        feedback: "Outstanding budget management! You demonstrate professional-level cost control skills.",
      },
      {
        level: "Proficient",
        scoreRange: [18, 22],
        description: "Stays within 5% of budget with good cost awareness",
        feedback: "Good budget management. You show solid understanding of cost control principles.",
      },
      {
        level: "Developing",
        scoreRange: [12, 17],
        description: "Exceeds budget by 5-15% but shows cost awareness",
        feedback: "Your budget management needs improvement. Consider reviewing high-cost items.",
      },
      {
        level: "Beginning",
        scoreRange: [0, 11],
        description: "Significantly over budget with poor cost control",
        feedback:
          "Budget management requires significant improvement. This would not be acceptable in professional practice.",
      },
    ],
  },
  materialSelection: {
    name: "Material Selection & Specification",
    maxScore: 25,
    criteria: [
      {
        level: "Excellent",
        scoreRange: [23, 25],
        description: "Comprehensive material selection with appropriate specifications",
        feedback: "Excellent material selection! You demonstrate thorough understanding of construction requirements.",
      },
      {
        level: "Proficient",
        scoreRange: [18, 22],
        description: "Good material selection with minor gaps",
        feedback: "Good material selection. Most essential components are included with appropriate specifications.",
      },
      {
        level: "Developing",
        scoreRange: [12, 17],
        description: "Basic material selection with some missing components",
        feedback: "Material selection shows understanding but has gaps. Review structural and finishing requirements.",
      },
      {
        level: "Beginning",
        scoreRange: [0, 11],
        description: "Inadequate material selection with major gaps",
        feedback: "Material selection needs significant improvement. Many essential components are missing.",
      },
    ],
  },
  costEfficiency: {
    name: "Cost Efficiency & Value Engineering",
    maxScore: 25,
    criteria: [
      {
        level: "Excellent",
        scoreRange: [23, 25],
        description: "Highly efficient cost per sqm with smart material choices",
        feedback: "Excellent cost efficiency! You demonstrate strong value engineering principles.",
      },
      {
        level: "Proficient",
        scoreRange: [18, 22],
        description: "Good cost efficiency within industry standards",
        feedback: "Good cost efficiency. Your cost per square meter is within acceptable industry ranges.",
      },
      {
        level: "Developing",
        scoreRange: [12, 17],
        description: "Moderate cost efficiency with room for optimization",
        feedback: "Cost efficiency could be improved. Consider alternative materials or construction methods.",
      },
      {
        level: "Beginning",
        scoreRange: [0, 11],
        description: "Poor cost efficiency, significantly above standards",
        feedback: "Cost efficiency needs major improvement. Current approach is not economically viable.",
      },
    ],
  },
  sustainability: {
    name: "Sustainability & Environmental Impact",
    maxScore: 15,
    criteria: [
      {
        level: "Excellent",
        scoreRange: [14, 15],
        description: "Strong focus on sustainable materials and practices",
        feedback: "Outstanding sustainability focus! Your choices would qualify for green building certifications.",
      },
      {
        level: "Proficient",
        scoreRange: [11, 13],
        description: "Good incorporation of sustainable elements",
        feedback: "Good sustainability awareness. You show understanding of environmental considerations.",
      },
      {
        level: "Developing",
        scoreRange: [6, 10],
        description: "Some sustainable elements with room for improvement",
        feedback: "Sustainability could be enhanced. Consider more eco-friendly material alternatives.",
      },
      {
        level: "Beginning",
        scoreRange: [0, 5],
        description: "Limited consideration of sustainability",
        feedback: "Sustainability needs attention. Modern construction requires environmental consciousness.",
      },
    ],
  },
  technicalAccuracy: {
    name: "Technical Accuracy & Industry Standards",
    maxScore: 10,
    criteria: [
      {
        level: "Excellent",
        scoreRange: [9, 10],
        description: "Accurate quantities and specifications meeting industry standards",
        feedback: "Excellent technical accuracy! Your specifications meet professional standards.",
      },
      {
        level: "Proficient",
        scoreRange: [7, 8],
        description: "Good technical accuracy with minor discrepancies",
        feedback: "Good technical accuracy. Most specifications are appropriate for the project type.",
      },
      {
        level: "Developing",
        scoreRange: [4, 6],
        description: "Basic technical accuracy with some errors",
        feedback: "Technical accuracy needs improvement. Review industry standards and best practices.",
      },
      {
        level: "Beginning",
        scoreRange: [0, 3],
        description: "Poor technical accuracy with significant errors",
        feedback: "Technical accuracy requires major improvement. Current specifications have serious issues.",
      },
    ],
  },
}

// Helper functions for rubrics
const getRubricLevel = (rubric, score) => {
  for (const criterion of rubric.criteria) {
    if (score >= criterion.scoreRange[0] && score <= criterion.scoreRange[1]) {
      return criterion.level
    }
  }
  return "Beginning"
}

const getRubricFeedback = (rubric, score) => {
  for (const criterion of rubric.criteria) {
    if (score >= criterion.scoreRange[0] && score <= criterion.scoreRange[1]) {
      return criterion.feedback
    }
  }
  return "Score needs improvement."
}

const getLetterGrade = (totalScore) => {
  if (totalScore >= 90) return "A"
  if (totalScore >= 80) return "B"
  if (totalScore >= 70) return "C"
  if (totalScore >= 60) return "D"
  return "F"
}

// Progress tracking component
const ProgressBar = ({ progress, totalSteps }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: (progress / totalSteps) * 100,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }, [progress, totalSteps])

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
      <Text style={styles.progressText}>
        {progress} of {totalSteps} completed
      </Text>
    </View>
  )
}

// Step indicators component
const ProgressSteps = ({ steps, currentStep, onStepPress }) => {
  return (
    <View style={styles.stepsContainer}>
      {steps.map((step, index) => (
        <TouchableOpacity
          key={index}
          style={styles.stepItem}
          onPress={() => onStepPress(index)}
          disabled={index > currentStep}
        >
          <View
            style={[
              styles.stepCircle,
              index < currentStep
                ? styles.completedStep
                : index === currentStep
                  ? styles.currentStep
                  : styles.futureStep,
            ]}
          >
            {index < currentStep ? (
              <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
              <Text style={styles.stepNumber}>{index + 1}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, index === currentStep && styles.currentStepLabel]}>{step.label}</Text>
          {index < steps.length - 1 && (
            <View style={[styles.stepConnector, index < currentStep && styles.completedConnector]} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}

const DesignPlanDetails = ({ route, navigation }) => {
  const { designPlan, classId, classKey } = route.params || {}
  const [isLoading, setIsLoading] = useState(true)
  const [planDetails, setPlanDetails] = useState(null)
  const [error, setError] = useState(null)
  const [budgetSpent, setBudgetSpent] = useState(0)
  const [materials, setMaterials] = useState([])
  const [materialsLoading, setMaterialsLoading] = useState(true)
  const [materialsError, setMaterialsError] = useState(null)

  const [designImage, setDesignImage] = useState(null)
  const [imageLoading, setImageLoading] = useState(true)

  // Cost estimation states
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [totalEstimatedCost, setTotalEstimatedCost] = useState(0)
  const [isEstimateModalVisible, setIsEstimateModalVisible] = useState(false)
  const [estimateName, setEstimateName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [floorArea, setFloorArea] = useState(0)
  const [showOptimizationTips, setShowOptimizationTips] = useState(false)

  //Image Preview
  const [isImageModalVisible, setIsImageModalVisible] = useState(false)

  // Progress tracking states
  const [currentProgress, setCurrentProgress] = useState(0)
  const [savingProgress, setSavingProgress] = useState(false)
  const [userId, setUserId] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completionData, setCompletionData] = useState(null)

  // Enhanced feedback states
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)
  const [showRubricModal, setShowRubricModal] = useState(false)
  const [classAnalytics, setClassAnalytics] = useState(null)

  // Define the steps for the design plan
  const progressSteps = [
    { label: "Review Plan", key: "review" },
    { label: "Materials", key: "materials" },
    { label: "Labor", key: "labor" },
    { label: "Equipment", key: "equipment" },
    { label: "Final Estimate", key: "final" },
  ]

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (designPlan) {
      // If we already have the design plan data, use it
      setPlanDetails(designPlan)

      // Set floor area from design plan if available
      if (designPlan.floor_area) {
        setFloorArea(Number.parseFloat(designPlan.floor_area) || 0)
      } else if (designPlan.dimensions) {
        // Try to calculate from dimensions if available
        try {
          const dimensions = JSON.parse(designPlan.dimensions)
          if (dimensions.width && dimensions.length) {
            setFloorArea(dimensions.width * dimensions.length)
          }
        } catch (e) {
          console.log("Could not parse dimensions", e)
        }
      }

      setIsLoading(false)

      // Fetch the design image
      fetchDesignImage(designPlan)

      // Fetch materials if we have teacher_id
      if (designPlan.teacher_id) {
        fetchMaterials(designPlan.teacher_id)
      } else {
        // Try to get teacher_id from the class
        fetchTeacherIdFromClass(classId)
      }

      // Fetch progress data if we have userId
      if (userId) {
        fetchStudentProgress(designPlan.id)
      }

      // Fetch class analytics for comparison
      if (classId) {
        fetchClassAnalytics()
      }
    } else if (route.params?.planId) {
      // If we only have the plan ID, fetch the details
      fetchPlanDetails(route.params.planId)
    } else {
      setError("No design plan information provided")
      setIsLoading(false)
      setMaterialsLoading(false)
    }
  }, [designPlan, route.params, userId])

  // Calculate total cost whenever selected materials change
  useEffect(() => {
    calculateTotalCost()
  }, [selectedMaterials])

  // Add this at the beginning of the component, right after the existing useEffect hooks
  useEffect(() => {
    // Check if the design plan is already completed when the component loads
    if (userId && designPlan?.id) {
      checkCompletionStatus(designPlan.id);
    }
  }, [userId, designPlan]);

  // Add this new function to check completion status
  const checkCompletionStatus = async (designPlanId) => {
    try {
      console.log('🔍 Checking completion status for plan:', designPlanId);
      
      const { data, error } = await supabase
        .from("student_progress")
        .select("is_completed, completed_at, final_score, final_letter_grade, completion_data")
        .eq("student_id", userId)
        .eq("design_plan_id", designPlanId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("❌ Error checking completion status:", error);
        return;
      }

      if (data && data.is_completed) {
        console.log('✅ Design plan already completed:', data);
        setIsCompleted(true);
        
        // Parse completion data if available
        if (data.completion_data) {
          try {
            const parsedData = JSON.parse(data.completion_data);
            setCompletionData(parsedData);
          } catch (e) {
            console.error("❌ Error parsing completion data:", e);
          }
        }
        
        // Set other completion-related state
        setCurrentProgress(progressSteps.length - 1);
      } else {
        console.log('📝 Design plan not completed yet');
        setIsCompleted(false);
      }
    } catch (err) {
      console.error("❌ Exception in checkCompletionStatus:", err);
    }
  };

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) throw error

      if (user) {
        setUserId(user.id)

        // Check if the user is a student
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)
        } else if (userData.role !== "student") {
          Alert.alert("Access Denied", "Only students can access design plan details.")
          navigation.goBack()
        }
      }
    } catch (err) {
      console.error("Error in fetchUserData:", err)
    }
  }

  const fetchClassAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from("class_scoring_analytics")
        .select("*")
        .eq("class_id", classId)
        .eq("design_plan_id", designPlan?.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching class analytics:", error)
      } else {
        setClassAnalytics(data)
      }
    } catch (err) {
      console.error("Exception fetching class analytics:", err)
    }
  }

  const fetchPlanDetails = async (planId) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.from("design_plan").select("*").eq("id", planId).single()

      if (error) {
        console.error("Error fetching plan details:", error)
        setError(`Failed to load plan details: ${error.message}`)
      } else if (data) {
        setPlanDetails(data)

        // Fetch the design image
        fetchDesignImage(data)

        // Set floor area from design plan if available
        if (data.floor_area) {
          setFloorArea(Number.parseFloat(data.floor_area) || 0)
        } else if (data.dimensions) {
          // Try to calculate from dimensions if available
          try {
            const dimensions = JSON.parse(data.dimensions)
            if (dimensions.width && dimensions.length) {
              setFloorArea(dimensions.width * dimensions.length)
            }
          } catch (e) {
            console.log("Could not parse dimensions", e)
          }
        }

        // Fetch materials if we have teacher_id
        if (data.teacher_id) {
          fetchMaterials(data.teacher_id)
        } else {
          // Try to get teacher_id from the class
          fetchTeacherIdFromClass(classId)
        }

        // Fetch progress data if we have userId
        if (userId) {
          fetchStudentProgress(data.id)
        }
      }
    } catch (err) {
      console.error("Exception in fetchPlanDetails:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeacherIdFromClass = async (classId) => {
    if (!classId) {
      setMaterialsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from("classes").select("teacher_id").eq("id", classId).single()

      if (error) {
        console.error("Error fetching teacher ID:", error)
        setMaterialsLoading(false)
      } else if (data && data.teacher_id) {
        fetchMaterials(data.teacher_id)
      } else {
        setMaterialsLoading(false)
      }
    } catch (err) {
      console.error("Exception in fetchTeacherIdFromClass:", err)
      setMaterialsLoading(false)
    }
  }

  const fetchMaterials = async (teacherId) => {
    try {
      setMaterialsLoading(true)

      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("material_name", { ascending: true })

      if (error) {
        console.error("Error fetching materials:", error)
        setMaterialsError(`Failed to load materials: ${error.message}`)
      } else if (data) {
        // Add a quantity field to each material for selection
        const materialsWithQuantity = data.map((material) => ({
          ...material,
          quantity: 0,
          isSelected: false,
          estimatedArea: 0,
        }))
        setMaterials(materialsWithQuantity)
      }
    } catch (err) {
      console.error("Exception in fetchMaterials:", err)
      setMaterialsError("An unexpected error occurred while loading materials")
    } finally {
      setMaterialsLoading(false)
    }
  }

  //Fetch Design Image
  const fetchDesignImage = async (plan) => {
    if (!plan) return

    try {
      setImageLoading(true)

      const filePath = plan.file_path // full path saved in DB
      if (!filePath) {
        console.log("⚠️ No file path available for this design plan")
        setImageLoading(false)
        return
      }

      console.log("🧪 designPlan.file_path =", filePath)

      const { data, error } = await supabase.storage.from("upload").getPublicUrl(filePath) // use exact path from DB

      if (error) {
        console.error("❌ Error getting public URL:", error)
      } else if (data?.publicUrl) {
        console.log("✅ Public URL:", data.publicUrl)
        setDesignImage(data.publicUrl)
      } else {
        console.log("⚠️ No public URL returned")
      }
    } catch (err) {
      console.error("❌ Exception fetching design image:", err)
    } finally {
      setImageLoading(false)
    }
  }

  // Fetch student progress
  const fetchStudentProgress = async (designPlanId) => {
    try {
      if (!userId || !designPlanId) return

      // First check if the student is enrolled in the class
      if (classId) {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("class_students")
          .select("*")
          .eq("student_id", userId)
          .eq("class_id", classId)
          .single()

        if (enrollmentError && enrollmentError.code !== "PGRST116") {
          console.error("Error checking enrollment:", enrollmentError)
        } else if (!enrollmentData && enrollmentError.code === "PGRST116") {
          console.log("Student not enrolled in this class")
          // We'll still allow them to view the plan, but won't track progress
          return
        }
      }

      const { data, error } = await supabase
        .from("student_progress")
        .select("*")
        .eq("student_id", userId)
        .eq("design_plan_id", designPlanId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // No progress found, initialize with 0
          setCurrentProgress(0)
          // Create a new progress record
          await createProgressRecord(designPlanId)
        } else {
          console.error("Error fetching student progress:", error)
        }
      } else if (data) {
        setCurrentProgress(data.progress_step)
        setIsCompleted(data.is_completed || false)
        setCompletionData(data.completion_data ? JSON.parse(data.completion_data) : null)
        // If there are saved cost estimates, load them
        if (data.cost_estimates) {
          updateMaterialsFromEstimates(data.cost_estimates)
        }
      }
    } catch (error) {
      console.error("Error in fetchStudentProgress:", error)
    }
  }

  // Create a new progress record
  const createProgressRecord = async (designPlanId) => {
    try {
      if (!userId || !designPlanId) return

      const { error } = await supabase.from("student_progress").insert([
        {
          student_id: userId,
          design_plan_id: designPlanId,
          class_id: classId,
          progress_step: 0,
          started_at: new Date().toISOString(),
          cost_estimates: {},
        },
      ])

      if (error) {
        console.error("Error creating progress record:", error)
      }
    } catch (error) {
      console.error("Exception in createProgressRecord:", error)
    }
  }

  // Update progress
  const updateProgress = async (step) => {
    try {
      if (!userId || !planDetails?.id) return

      setSavingProgress(true)

      // Only update if the new step is greater than the current progress
      if (step > currentProgress) {
        setCurrentProgress(step)

        const { error } = await supabase
          .from("student_progress")
          .update({
            progress_step: step,
            updated_at: new Date().toISOString(),
          })
          .eq("student_id", userId)
          .eq("design_plan_id", planDetails.id)

        if (error) {
          console.error("Error updating progress:", error)
          Alert.alert("Error", "Failed to update progress.")
        }
      }
    } catch (error) {
      console.error("Exception in updateProgress:", error)
      Alert.alert("Error", "An unexpected error occurred while updating progress.")
    } finally {
      setSavingProgress(false)
    }
  }

  // Handle step press
  const handleStepPress = (stepIndex) => {
    // Only allow navigating to completed steps or the next available step
    if (stepIndex <= currentProgress) {
      // Navigate to the selected step's content
      // For demonstration, we'll just scroll to that section
      // In a real app, you might show/hide different sections
      Alert.alert("Step Selected", `You selected: ${progressSteps[stepIndex].label}`)
    }
  }

  // Complete current step
  const completeCurrentStep = () => {
    if (currentProgress < progressSteps.length - 1) {
      updateProgress(currentProgress + 1)
      Alert.alert("Progress Updated", `Completed: ${progressSteps[currentProgress].label}`)
    } else {
      // Final step completed
      Alert.alert("Congratulations!", "You have completed all steps for this design plan.", [{ text: "OK" }])
    }
  }

  // Update materials from saved cost estimates
  const updateMaterialsFromEstimates = (costEstimates) => {
    // This function would update the selected materials based on saved cost estimates
    // For now, we'll just log it
    console.log("Saved cost estimates:", costEstimates)
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  const handleViewBudgetDetails = () => {
    // Navigate to a detailed budget breakdown
    Alert.alert("Budget Details", "This would show a detailed breakdown of the budget allocation and spending.", [
      { text: "OK" },
    ])
  }

  const handleOpenDesignFile = () => {
    if (planDetails?.design_file_url) {
      Linking.openURL(planDetails.design_file_url).catch((err) => {
        console.error("Error opening design file:", err)
        Alert.alert("Error", "Could not open the design file URL")
      })
    } else {
      Alert.alert("No File", "No design file URL is available for this plan")
    }
  }

  // Format currency with the appropriate symbol
  const formatCurrency = (amount, currency = "PHP") => {
    if (!amount && amount !== 0) return "N/A"

    let symbol = "₱" // Default to Philippine Peso

    // Set symbol based on currency code
    switch (currency?.toUpperCase()) {
      case "USD":
        symbol = "$"
        break
      case "EUR":
        symbol = "€"
        break
      case "GBP":
        symbol = "£"
        break
      case "JPY":
        symbol = "¥"
        break
      case "PHP":
        symbol = "₱"
        break
      default:
        symbol = "₱" // Default
    }

    // Format with thousand separators
    return `${symbol}${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
  }

  // Handle material selection
  const handleSelectMaterial = (material, index) => {
    const updatedMaterials = [...materials]
    updatedMaterials[index].isSelected = !updatedMaterials[index].isSelected

    // If selecting, set default quantity to 1
    if (updatedMaterials[index].isSelected && updatedMaterials[index].quantity === 0) {
      updatedMaterials[index].quantity = 1

      // For flooring materials, estimate area needed
      if (
        material.unit.toLowerCase().includes("sqm") ||
        material.unit.toLowerCase().includes("sq.m") ||
        material.unit.toLowerCase().includes("square meter")
      ) {
        updatedMaterials[index].estimatedArea = floorArea
        updatedMaterials[index].quantity = Math.ceil(floorArea)
      }
    }

    setMaterials(updatedMaterials)

    // Update selected materials list
    const selected = updatedMaterials.filter((m) => m.isSelected)
    setSelectedMaterials(selected)
  }

  // Handle quantity change
  const handleQuantityChange = (text, index) => {
    const quantity = text === "" ? 0 : Number.parseFloat(text)
    if (isNaN(quantity)) return

    const updatedMaterials = [...materials]
    updatedMaterials[index].quantity = quantity
    setMaterials(updatedMaterials)

    // Update selected materials list
    const selected = updatedMaterials.filter((m) => m.isSelected)
    setSelectedMaterials(selected)
  }

  // Calculate total cost
  const calculateTotalCost = () => {
    const total = selectedMaterials.reduce((sum, material) => {
      return sum + material.price * material.quantity
    }, 0)

    setTotalEstimatedCost(total)
    return total
  }

  // Enhanced scoring calculation with educational rubrics
  const calculateEducationalScore = (totalCost, budget, planDetails, selectedMaterials, floorArea) => {
    const scoreData = {
      overallScore: 0,
      letterGrade: "",
      categories: {},
      educationalFeedback: [],
      recommendations: [],
      strengths: [],
      areasForImprovement: [],
    }

    // 1. Budget Management Assessment
    const budgetRatio = totalCost / budget
    let budgetScore = 0

    if (budgetRatio <= 0.85) budgetScore = 25
    else if (budgetRatio <= 0.95) budgetScore = 22
    else if (budgetRatio <= 1.0) budgetScore = 19
    else if (budgetRatio <= 1.05) budgetScore = 15
    else if (budgetRatio <= 1.15) budgetScore = 10
    else budgetScore = 5

    scoreData.categories.budgetManagement = {
      score: budgetScore,
      maxScore: 25,
      level: getRubricLevel(EDUCATIONAL_RUBRICS.budgetManagement, budgetScore),
      feedback: getRubricFeedback(EDUCATIONAL_RUBRICS.budgetManagement, budgetScore),
    }

    // 2. Enhanced Material Selection Assessment with Answer Key Comparison
    let materialScore = 0
    let answerKeyMatchScore = 0
    let essentialMaterialsScore = 0

    // Get instructor's selected materials (answer key) from the design plan
    const instructorAnswerKey = planDetails?.selected_materials || []

    if (instructorAnswerKey.length > 0) {
      // Handle both old format (array of IDs) and new format (array of objects)
      let instructorMaterialData = []

      if (typeof instructorAnswerKey[0] === "object") {
        // New format with quantity and cost data
        instructorMaterialData = instructorAnswerKey
      } else {
        // Old format (just IDs) - convert for compatibility
        instructorMaterialData = instructorAnswerKey.map((id) => ({
          material_id: id,
          quantity: 1,
          cost: 0,
        }))
      }

      // Compare student selections against instructor's answer key
      const studentMaterialIds = selectedMaterials.map((m) => m.id)
      const instructorMaterialIds = instructorMaterialData.map((item) => item.material_id)

      // Calculate how many materials match the answer key
      const matchingMaterials = studentMaterialIds.filter((id) => instructorMaterialIds.includes(id))
      const extraMaterials = studentMaterialIds.filter((id) => !instructorMaterialIds.includes(id))
      const missedMaterials = instructorMaterialIds.filter((id) => !studentMaterialIds.includes(id))

      // Enhanced scoring with quantity and cost comparison
      let quantityAccuracyScore = 0
      let costAccuracyScore = 0

      if (typeof instructorAnswerKey[0] === "object") {
        // Calculate quantity and cost accuracy for matching materials
        matchingMaterials.forEach((materialId) => {
          const studentMaterial = selectedMaterials.find((m) => m.id === materialId)
          const instructorMaterial = instructorMaterialData.find((m) => m.material_id === materialId)

          if (studentMaterial && instructorMaterial) {
            // Quantity accuracy (within 20% tolerance gets full points)
            const quantityRatio =
              Math.abs(studentMaterial.quantity - instructorMaterial.quantity) / instructorMaterial.quantity
            if (quantityRatio <= 0.2) quantityAccuracyScore += 2
            else if (quantityRatio <= 0.5) quantityAccuracyScore += 1

            // Cost accuracy (within 15% tolerance gets full points)
            if (instructorMaterial.cost > 0) {
              const costRatio = Math.abs(studentMaterial.price - instructorMaterial.cost) / instructorMaterial.cost
              if (costRatio <= 0.15) costAccuracyScore += 2
              else if (costRatio <= 0.3) costAccuracyScore += 1
            }
          }
        })
      }

      // Answer key match score (40% of material selection score)
      const matchPercentage = matchingMaterials.length / Math.max(instructorMaterialIds.length, 1)
      answerKeyMatchScore = Math.round(matchPercentage * 10) // Max 10 points for material matching

      // Add quantity and cost accuracy bonuses
      answerKeyMatchScore += Math.min(quantityAccuracyScore, 3) // Max 3 bonus points for quantity accuracy
      answerKeyMatchScore += Math.min(costAccuracyScore, 2) // Max 2 bonus points for cost accuracy

      // Penalty for extra materials (reduce score for unnecessary selections)
      const extraPenalty = Math.min(extraMaterials.length * 1, 5) // Max 5 point penalty
      answerKeyMatchScore = Math.max(0, answerKeyMatchScore - extraPenalty)

      // Essential materials coverage (60% of material selection score)
      const essentialMaterials = [
        "cement",
        "concrete",
        "steel",
        "rebar",
        "sand",
        "gravel",
        "aggregate",
        "wood",
        "lumber",
        "tile",
        "flooring",
        "paint",
        "primer",
        "roofing",
        "insulation",
        "drywall",
        "plumbing",
        "electrical",
        "windows",
        "doors",
      ]

      const selectedMaterialNames = selectedMaterials.map((m) => m.material_name.toLowerCase())
      let essentialCount = 0

      essentialMaterials.forEach((material) => {
        if (selectedMaterialNames.some((name) => name.includes(material))) {
          essentialCount++
        }
      })

      const essentialCompleteness = essentialCount / essentialMaterials.length
      essentialMaterialsScore = Math.round(essentialCompleteness * 10) // Max 10 points

      materialScore = answerKeyMatchScore + essentialMaterialsScore

      // Store additional data for detailed feedback
      scoreData.materialAnalysis = {
        totalInstructorMaterials: instructorMaterialIds.length,
        matchingMaterials: matchingMaterials.length,
        extraMaterials: extraMaterials.length,
        missedMaterials: missedMaterials.length,
        matchPercentage: (matchPercentage * 100).toFixed(1),
        answerKeyScore: answerKeyMatchScore,
        essentialScore: essentialMaterialsScore,
        quantityAccuracy: quantityAccuracyScore,
        costAccuracy: costAccuracyScore,
        hasDetailedAnswerKey: typeof instructorAnswerKey[0] === "object",
      }
    } else {
      // Fallback to original scoring if no answer key is available
      const essentialMaterials = [
        "cement",
        "concrete",
        "steel",
        "rebar",
        "sand",
        "gravel",
        "aggregate",
        "wood",
        "lumber",
        "tile",
        "flooring",
        "paint",
        "primer",
        "roofing",
        "insulation",
        "drywall",
        "plumbing",
        "electrical",
        "windows",
        "doors",
      ]

      const selectedMaterialNames = selectedMaterials.map((m) => m.material_name.toLowerCase())
      let essentialCount = 0

      essentialMaterials.forEach((material) => {
        if (selectedMaterialNames.some((name) => name.includes(material))) {
          essentialCount++
        }
      })

      const materialCompleteness = essentialCount / essentialMaterials.length
      materialScore = Math.round(materialCompleteness * 25)

      scoreData.materialAnalysis = {
        fallbackScoring: true,
        essentialMaterialsFound: essentialCount,
        totalEssentialMaterials: essentialMaterials.length,
      }
    }

    scoreData.categories.materialSelection = {
      score: materialScore,
      maxScore: 25,
      level: getRubricLevel(EDUCATIONAL_RUBRICS.materialSelection, materialScore),
      feedback: getRubricFeedback(EDUCATIONAL_RUBRICS.materialSelection, materialScore),
    }

    // 3. Cost Efficiency Assessment
    const costPerSqm = totalCost / (floorArea || 100)
    const lowCostStandard = 15000 // PHP per sqm
    const highCostStandard = 30000 // PHP per sqm

    let efficiencyScore = 0
    if (costPerSqm <= lowCostStandard) efficiencyScore = 25
    else if (costPerSqm <= 20000) efficiencyScore = 20
    else if (costPerSqm <= 25000) efficiencyScore = 15
    else if (costPerSqm <= highCostStandard) efficiencyScore = 10
    else efficiencyScore = 5

    scoreData.categories.costEfficiency = {
      score: efficiencyScore,
      maxScore: 25,
      level: getRubricLevel(EDUCATIONAL_RUBRICS.costEfficiency, efficiencyScore),
      feedback: getRubricFeedback(EDUCATIONAL_RUBRICS.costEfficiency, efficiencyScore),
    }

    // 4. Sustainability Assessment
    const sustainableKeywords = [
      "bamboo",
      "recycled",
      "sustainable",
      "eco",
      "green",
      "renewable",
      "low-voc",
      "energy-efficient",
      "solar",
      "led",
      "insulated",
    ]

    let sustainableCount = 0
    const selectedMaterialNames = selectedMaterials.map((m) => m.material_name.toLowerCase())
    selectedMaterialNames.forEach((name) => {
      if (sustainableKeywords.some((keyword) => name.includes(keyword))) {
        sustainableCount++
      }
    })

    const sustainabilityRatio = sustainableCount / Math.max(selectedMaterials.length, 1)
    const sustainabilityScore = Math.min(15, Math.round(sustainabilityRatio * 30))

    scoreData.categories.sustainability = {
      score: sustainabilityScore,
      maxScore: 15,
      level: getRubricLevel(EDUCATIONAL_RUBRICS.sustainability, sustainabilityScore),
      feedback: getRubricFeedback(EDUCATIONAL_RUBRICS.sustainability, sustainabilityScore),
    }

    // 5. Technical Accuracy Assessment
    const hasStructuralMaterials = selectedMaterialNames.some((name) =>
      ["cement", "steel", "rebar", "concrete"].some((structural) => name.includes(structural)),
    )
    const hasFinishingMaterials = selectedMaterialNames.some((name) =>
      ["paint", "tile", "flooring"].some((finishing) => name.includes(finishing)),
    )
    const hasRoofingMaterials = selectedMaterialNames.some((name) =>
      ["roofing", "roof", "shingle"].some((roofing) => name.includes(roofing)),
    )

    let technicalScore = 0
    if (hasStructuralMaterials) technicalScore += 4
    if (hasFinishingMaterials) technicalScore += 3
    if (hasRoofingMaterials) technicalScore += 3

    scoreData.categories.technicalAccuracy = {
      score: technicalScore,
      maxScore: 10,
      level: getRubricLevel(EDUCATIONAL_RUBRICS.technicalAccuracy, technicalScore),
      feedback: getRubricFeedback(EDUCATIONAL_RUBRICS.technicalAccuracy, technicalScore),
    }

    // Calculate overall score
    scoreData.overallScore = Object.values(scoreData.categories).reduce((total, category) => total + category.score, 0)

    // Assign letter grade
    scoreData.letterGrade = getLetterGrade(scoreData.overallScore)

    // Generate educational feedback
    generateEducationalFeedback(scoreData)

    return scoreData
  }

  const generateEducationalFeedback = (scoreData) => {
    // Identify strengths
    Object.entries(scoreData.categories).forEach(([key, category]) => {
      if (category.score >= category.maxScore * 0.8) {
        scoreData.strengths.push(`${EDUCATIONAL_RUBRICS[key]?.name || key}: ${category.level}`)
      } else if (category.score < category.maxScore * 0.6) {
        scoreData.areasForImprovement.push(`${EDUCATIONAL_RUBRICS[key]?.name || key}: ${category.level}`)
      }
    })

    // Generate specific recommendations
    if (scoreData.categories.budgetManagement.score < 15) {
      scoreData.recommendations.push("Review material quantities and explore cost-effective alternatives")
      scoreData.recommendations.push("Consider phased construction to spread costs over time")
    }

    if (scoreData.categories.materialSelection.score < 18) {
      scoreData.recommendations.push(
        "Ensure all building systems are represented (structural, mechanical, electrical, finishes)",
      )
      scoreData.recommendations.push("Research local building codes and material requirements")
    }

    if (scoreData.categories.sustainability.score < 10) {
      scoreData.recommendations.push("Incorporate more sustainable materials and energy-efficient systems")
      scoreData.recommendations.push("Consider life-cycle costs and environmental impact")
    }

    // Generate specific feedback based on answer key comparison
    if (scoreData.materialAnalysis && !scoreData.materialAnalysis.fallbackScoring) {
      const analysis = scoreData.materialAnalysis

      if (analysis.matchPercentage >= 80) {
        scoreData.strengths.push(
          `Excellent material selection: ${analysis.matchPercentage}% match with instructor's answer key`,
        )
      } else if (analysis.matchPercentage >= 60) {
        scoreData.recommendations.push(
          `Good material selection, but consider reviewing ${analysis.missedMaterials} missed materials from the answer key`,
        )
      } else {
        scoreData.areasForImprovement.push(
          `Material selection needs improvement: Only ${analysis.matchPercentage}% match with expected materials`,
        )
      }

      // Add quantity and cost specific feedback
      if (analysis.hasDetailedAnswerKey) {
        if (analysis.quantityAccuracy >= 5) {
          scoreData.strengths.push("Excellent quantity estimation - very close to instructor expectations")
        } else if (analysis.quantityAccuracy >= 3) {
          scoreData.recommendations.push("Good quantity estimation, but some materials could be more accurate")
        } else {
          scoreData.areasForImprovement.push(
            "Quantity estimation needs improvement - review material requirements carefully",
          )
        }

        if (analysis.costAccuracy >= 4) {
          scoreData.strengths.push("Excellent cost estimation - prices are very close to expected values")
        } else if (analysis.costAccuracy >= 2) {
          scoreData.recommendations.push("Good cost awareness, but research current market prices for better accuracy")
        } else {
          scoreData.areasForImprovement.push("Cost estimation needs improvement - research current material prices")
        }
      }

      // Add educational context about answer key scoring
      scoreData.educationalFeedback.push(
        `Your material selection was compared against the instructor's answer key, which represents the optimal material choices for this design plan.`,
      )
      scoreData.educationalFeedback.push(
        `Answer key matching accounts for 60% of your material selection score, while essential material coverage accounts for 40%.`,
      )
    } else {
      scoreData.educationalFeedback.push(
        `Material selection was evaluated based on essential construction materials coverage since no instructor answer key was available.`,
      )
    }

    // Add educational context
    scoreData.educationalFeedback.push(
      "Professional architects typically maintain a 5-10% contingency in their budgets for unexpected costs.",
    )
    scoreData.educationalFeedback.push(
      "Material costs usually represent 60-70% of total construction costs in residential projects.",
    )
    scoreData.educationalFeedback.push("Sustainable design practices can reduce long-term operational costs by 20-30%.")
  }

  // Enhanced save function with comprehensive scoring
  const saveEstimate = async () => {
    if (!estimateName.trim()) {
      Alert.alert("Error", "Please provide a name for this estimate");
      return;
    }

    setIsSaving(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "You must be logged in to save estimates");
        setIsSaving(false);
        return;
      }

      console.log('💾 Saving estimate for user:', user.id);
      console.log('💾 Design plan ID:', planDetails?.id);

      // Calculate enhanced educational score
      const scoreData = calculateEducationalScore(
        totalEstimatedCost,
        planDetails?.budget || 300000,
        planDetails,
        selectedMaterials,
        floorArea,
      );

      // Create estimate record
      const { data: estimate, error: estimateError } = await supabase
        .from("cost_estimates")
        .insert({
          name: estimateName,
          design_plan_id: planDetails?.id,
          student_id: user.id,
          total_cost: totalEstimatedCost,
          status: "completed",
          class_id: classId,
          score: scoreData.overallScore,
          letter_grade: scoreData.letterGrade,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (estimateError) {
        console.error("❌ Error saving estimate:", estimateError);
        Alert.alert("Error", `Failed to save estimate: ${estimateError.message}`);
        setIsSaving(false);
        return;
      }

      console.log('✅ Estimate saved:', estimate);

      // Save estimate items
      const estimateItems = selectedMaterials.map((material) => ({
        estimate_id: estimate.id,
        material_id: material.id,
        quantity: material.quantity,
        unit_price: material.price,
        total_price: material.price * material.quantity,
      }));

      const { error: itemsError } = await supabase.from("cost_estimate_items").insert(estimateItems);

      if (itemsError) {
        console.error("⚠️ Error saving estimate items:", itemsError);
        Alert.alert("Warning", `Estimate saved but items failed: ${itemsError.message}`);
      }

      // Save detailed scoring data
      const { error: scoreError } = await supabase.from("student_scores").insert({
        student_id: user.id,
        estimate_id: estimate.id,
        design_plan_id: planDetails?.id,
        class_id: classId,
        rubric: "cost_estimation",
        overall_score: scoreData.overallScore,
        max_score: 100,
        letter_grade: scoreData.letterGrade,
        budget_management_score: scoreData.categories.budgetManagement.score,
        material_selection_score: scoreData.categories.materialSelection.score,
        cost_efficiency_score: scoreData.categories.costEfficiency.score,
        sustainability_score: scoreData.categories.sustainability.score,
        technical_accuracy_score: scoreData.categories.technicalAccuracy.score,
        feedback_data: JSON.stringify({
          categories: scoreData.categories,
          strengths: scoreData.strengths,
          areasForImprovement: scoreData.areasForImprovement,
          recommendations: scoreData.recommendations,
          educationalFeedback: scoreData.educationalFeedback,
        }),
        created_at: new Date().toISOString(),
      });

      if (scoreError) {
        console.error("⚠️ Error saving score data:", scoreError);
      }

      // Update progress to final step
      updateProgress(progressSteps.length - 1);

      // CRITICAL PART: Update the student_progress table with completion status
      try {
        // Create completion data object
        const completionData = {
          completed_at: new Date().toISOString(),
          final_score: scoreData.overallScore,
          letter_grade: scoreData.letterGrade,
          total_cost: totalEstimatedCost,
          materials_count: selectedMaterials.length,
          budget_utilization: ((totalEstimatedCost / (planDetails?.budget || 300000)) * 100).toFixed(1),
        };

        console.log('📝 Saving completion data:', completionData);

        // Check if a progress record exists
        const { data: existingProgress, error: checkError } = await supabase
          .from("student_progress")
          .select("id")
          .eq("student_id", user.id)
          .eq("design_plan_id", planDetails.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("❌ Error checking existing progress:", checkError);
        }

        if (existingProgress) {
          // Update existing record
          console.log('🔄 Updating existing progress record...');
          const { data: updatedProgress, error: updateError } = await supabase
            .from("student_progress")
            .update({
              is_completed: true,
              completed_at: new Date().toISOString(),
              completion_data: JSON.stringify(completionData),
              final_score: scoreData.overallScore,
              final_letter_grade: scoreData.letterGrade,
              progress_step: progressSteps.length - 1,
              updated_at: new Date().toISOString(),
            })
            .eq("student_id", user.id)
            .eq("design_plan_id", planDetails.id)
            .select();

          if (updateError) {
            console.error("❌ Error updating progress:", updateError);
          } else {
            console.log("✅ Progress updated successfully:", updatedProgress);
          }
        } else {
          // Create new progress record
          console.log('➕ Creating new progress record...');
          const { data: newProgress, error: createError } = await supabase
            .from("student_progress")
            .insert({
              student_id: user.id,
              design_plan_id: planDetails.id,
              class_id: classId,
              progress_step: progressSteps.length - 1,
              is_completed: true,
              started_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
              completion_data: JSON.stringify(completionData),
              final_score: scoreData.overallScore,
              final_letter_grade: scoreData.letterGrade,
              updated_at: new Date().toISOString(),
            })
            .select();

          if (createError) {
            console.error("❌ Error creating progress:", createError);
          } else {
            console.log("✅ Progress created successfully:", newProgress);
          }
        }

        // Update local state
        setIsCompleted(true);
        setCompletionData(completionData);
        setCurrentProgress(progressSteps.length - 1);
      } catch (err) {
        console.error("❌ Exception updating completion status:", err);
      }

      // Show completion dialog with enhanced feedback
      showCompletionDialog(scoreData);
      setIsEstimateModalVisible(false);
    } catch (err) {
      console.error("❌ Exception in saveEstimate:", err);
      Alert.alert("Error", "An unexpected error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  // Enhanced completion dialog with comprehensive feedback
  const showCompletionDialog = (scoreData) => {
    // Create a formatted message for the alert
    const scoreMessage = `Your Design Plan Score: ${scoreData.overallScore}/100 (${scoreData.letterGrade})\n\n`

    const breakdownMessage = Object.entries(scoreData.categories)
      .map(([key, data]) => `${EDUCATIONAL_RUBRICS[key]?.name}: ${data.score}/${data.maxScore} (${data.level})`)
      .join("\n")

    // Show the completion alert
    Alert.alert("Design Plan Completed!", `${scoreMessage}${breakdownMessage}`, [
      {
        text: "View Detailed Feedback",
        onPress: () => showDetailedFeedback(scoreData),
      },
      {
        text: "OK",
        style: "default",
      },
    ])
  }

  // Show detailed feedback in a modal
  const showDetailedFeedback = (scoreData) => {
    setFeedbackData(scoreData)
    setIsFeedbackModalVisible(true)
  }

  // Show rubric information
  const showRubricInfo = () => {
    setShowRubricModal(true)
  }

  // Get budget status
  const getBudgetStatus = () => {
    const budget = planDetails?.budget || 300000

    if (totalEstimatedCost > budget) {
      return {
        status: "over",
        message: "Over budget",
        color: "#FF6B6B",
      }
    } else if (totalEstimatedCost > budget * 0.9) {
      return {
        status: "warning",
        message: "Near budget limit",
        color: "#FFB347",
      }
    } else {
      return {
        status: "good",
        message: "Within budget",
        color: "#4CAF50",
      }
    }
  }

  // Generate optimization tips
  const generateOptimizationTips = () => {
    const tips = []

    if (totalEstimatedCost > (planDetails?.budget || 300000) * 1.05) {
      tips.push({
        title: "Reduce Material Quantities",
        description: "Review your material quantities and look for opportunities to reduce waste or use less material.",
        savings: "5-10%",
      })
    }

    if (selectedMaterials.length > 5 && totalEstimatedCost > (planDetails?.budget || 300000) * 0.8) {
      tips.push({
        title: "Consider Alternative Materials",
        description:
          "Explore less expensive but equally effective materials. Research local suppliers for better deals.",
        savings: "10-15%",
      })
    }

    if (planDetails?.floor_area && totalEstimatedCost / planDetails.floor_area > 25000) {
      tips.push({
        title: "Optimize Space Usage",
        description:
          "Re-evaluate the design to minimize the floor area without compromising functionality. Smaller spaces require fewer materials.",
        savings: "8-12%",
      })
    }

    return tips
  }

  // Calculate remaining budget and percentage
  const budget = planDetails?.budget || 300000
  const currency = planDetails?.currency || "PHP"
  const remaining = budget - totalEstimatedCost
  const spentPercentage = (totalEstimatedCost / budget) * 100
  const budgetStatus = getBudgetStatus()
  const optimizationTips = generateOptimizationTips()

  // Render optimization tip item
  const renderOptimizationTip = (tip, index) => (
    <View key={index} style={styles.tipItem}>
      <Ionicons name="bulb-outline" size={24} color="#FFB347" />
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{tip.title}</Text>
        <Text style={styles.tipDescription}>{tip.description}</Text>
        <Text style={styles.tipSavings}>Potential Savings: {tip.savings}</Text>
      </View>
    </View>
  )

  // Enhanced Feedback Modal with comprehensive scoring details
  const renderFeedbackModal = () => (
    <Modal
      visible={isFeedbackModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsFeedbackModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: Dimensions.get("window").height * 0.9 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Educational Assessment</Text>
            <TouchableOpacity onPress={() => setIsFeedbackModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {feedbackData && (
              <>
                {/* Overall Score Section */}
                <View style={styles.scoreSection}>
                  <Text style={styles.scoreSectionTitle}>Overall Performance</Text>
                  <View style={styles.scoreDisplay}>
                    <View style={styles.scoreCircle}>
                      <Text style={styles.scoreValue}>{feedbackData.overallScore}</Text>
                      <Text style={styles.scoreMax}>/100</Text>
                    </View>
                    <View style={styles.gradeInfo}>
                      <View
                        style={[
                          styles.gradeBadge,
                          {
                            backgroundColor:
                              feedbackData.letterGrade === "A"
                                ? "#4CAF50"
                                : feedbackData.letterGrade === "B"
                                  ? "#8BC34A"
                                  : feedbackData.letterGrade === "C"
                                    ? "#FFC107"
                                    : feedbackData.letterGrade === "D"
                                      ? "#FF9800"
                                      : "#F44336",
                          },
                        ]}
                      >
                        <Text style={styles.gradeText}>{feedbackData.letterGrade}</Text>
                      </View>
                      {classAnalytics && (
                        <Text style={styles.classComparison}>
                          Class Average: {classAnalytics.average_score?.toFixed(1) || "N/A"}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Category Breakdown */}
                <View style={styles.scoreBreakdownSection}>
                  <Text style={styles.scoreSectionTitle}>Category Performance</Text>
                  {Object.entries(feedbackData.categories).map(([key, data], index) => (
                    <View key={index} style={styles.categoryCard}>
                      <View style={styles.categoryHeader}>
                        <Text style={styles.categoryTitle}>{EDUCATIONAL_RUBRICS[key]?.name}</Text>
                        <View style={styles.categoryScoreContainer}>
                          <Text style={styles.categoryScore}>
                            {data.score}/{data.maxScore}
                          </Text>
                          <Text style={styles.categoryLevel}>{data.level}</Text>
                        </View>
                      </View>
                      <View style={styles.categoryProgressContainer}>
                        <View
                          style={[
                            styles.categoryProgress,
                            { width: `${(data.score / data.maxScore) * 100}%` },
                            data.score / data.maxScore >= 0.8
                              ? styles.progressHigh
                              : data.score / data.maxScore >= 0.6
                                ? styles.progressMedium
                                : styles.progressLow,
                          ]}
                        />
                      </View>
                      <Text style={styles.categoryFeedback}>{data.feedback}</Text>
                    </View>
                  ))}
                </View>

                {/* Strengths */}
                {feedbackData.strengths && feedbackData.strengths.length > 0 && (
                  <View style={styles.strengthsSection}>
                    <Text style={styles.scoreSectionTitle}>Your Strengths</Text>
                    {feedbackData.strengths.map((strength, index) => (
                      <View key={index} style={styles.strengthItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.strengthText}>{strength}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Areas for Improvement */}
                {feedbackData.areasForImprovement && feedbackData.areasForImprovement.length > 0 && (
                  <View style={styles.improvementSection}>
                    <Text style={styles.scoreSectionTitle}>Areas for Improvement</Text>
                    {feedbackData.areasForImprovement.map((area, index) => (
                      <View key={index} style={styles.improvementItem}>
                        <Ionicons name="alert-circle" size={20} color="#FF9800" />
                        <Text style={styles.improvementText}>{area}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Educational Feedback */}
                <View style={styles.educationalSection}>
                  <Text style={styles.scoreSectionTitle}>Educational Insights</Text>
                  {feedbackData.educationalFeedback.map((insight, index) => (
                    <View key={index} style={styles.insightItem}>
                      <Ionicons name="school-outline" size={20} color="#176BB7" />
                      <Text style={styles.insightText}>{insight}</Text>
                    </View>
                  ))}
                </View>

                {/* Recommendations */}
                <View style={styles.recommendationsSection}>
                  <Text style={styles.scoreSectionTitle}>Recommendations</Text>
                  {feedbackData.recommendations.map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Ionicons name="bulb-outline" size={20} color="#FFB347" />
                      <Text style={styles.recommendationText}>{recommendation}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsFeedbackModalVisible(false)}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  // Rubric Information Modal
  const renderRubricModal = () => (
    <Modal
      visible={showRubricModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowRubricModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: Dimensions.get("window").height * 0.9 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scoring Rubric</Text>
            <TouchableOpacity onPress={() => setShowRubricModal(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {Object.entries(EDUCATIONAL_RUBRICS).map(([key, rubric], index) => (
              <View key={index} style={styles.rubricCategory}>
                <Text style={styles.rubricCategoryTitle}>
                  {rubric.name} ({rubric.maxScore} points)
                </Text>
                {rubric.criteria.map((criterion, criterionIndex) => (
                  <View key={criterionIndex} style={styles.rubricCriterion}>
                    <View style={styles.rubricCriterionHeader}>
                      <Text style={styles.rubricLevel}>{criterion.level}</Text>
                      <Text style={styles.rubricRange}>
                        {criterion.scoreRange[0]}-{criterion.scoreRange[1]} pts
                      </Text>
                    </View>
                    <Text style={styles.rubricDescription}>{criterion.description}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowRubricModal(false)}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  // Render material item
  const renderMaterialItem = ({ item, index }) => (
    <View style={[styles.materialItem, item.isSelected && styles.selectedMaterialItem]}>
      <View style={styles.materialHeader}>
        <TouchableOpacity style={styles.materialSelectButton} onPress={() => handleSelectMaterial(item, index)}>
          <Ionicons
            name={item.isSelected ? "checkbox-outline" : "square-outline"}
            size={24}
            color={item.isSelected ? "#176BB7" : "#666"}
          />
          <Text style={styles.materialName}>{item.material_name}</Text>
        </TouchableOpacity>
        <Text style={styles.materialPrice}>{formatCurrency(item.price, currency)}</Text>
      </View>
      <Text style={styles.materialDescription}>{item.description}</Text>

      {item.isSelected && (
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                if (item.quantity > 0) {
                  handleQuantityChange((item.quantity - 1).toString(), index)
                }
              }}
            >
              <Ionicons name="remove" size={20} color="#176BB7" />
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={item.quantity.toString()}
              onChangeText={(text) => handleQuantityChange(text, index)}
            />
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange((item.quantity + 1).toString(), index)}
            >
              <Ionicons name="add" size={20} color="#176BB7" />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemTotal}>Item Total: {formatCurrency(item.price * item.quantity, currency)}</Text>
        </View>
      )}

      <View style={styles.materialFooter}>
        <Text style={styles.materialUnit}>Unit: {item.unit}</Text>
      </View>
    </View>
  )

  // Render save estimate modal
  const renderSaveEstimateModal = () => (
    <Modal visible={isEstimateModalVisible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Save Cost Estimate</Text>
            <TouchableOpacity onPress={() => setIsEstimateModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>Give this estimate a name and receive your educational assessment</Text>

          <TextInput
            style={styles.estimateNameInput}
            placeholder="Estimate Name"
            value={estimateName}
            onChangeText={setEstimateName}
          />

          <View style={styles.estimateSummary}>
            <Text style={styles.estimateSummaryTitle}>Estimate Summary</Text>
            <View style={styles.estimateSummaryRow}>
              <Text style={styles.estimateSummaryLabel}>Total Materials:</Text>
              <Text style={styles.estimateSummaryValue}>{selectedMaterials.length}</Text>
            </View>
            <View style={styles.estimateSummaryRow}>
              <Text style={styles.estimateSummaryLabel}>Total Estimated Cost:</Text>
              <Text style={styles.estimateSummaryValue}>{formatCurrency(totalEstimatedCost, currency)}</Text>
            </View>
            <View style={styles.estimateSummaryRow}>
              <Text style={styles.estimateSummaryLabel}>Budget Utilization:</Text>
              <Text style={styles.estimateSummaryValue}>{((totalEstimatedCost / budget) * 100).toFixed(1)}%</Text>
            </View>
          </View>

          <View style={styles.scoringInfo}>
            <Text style={styles.scoringInfoTitle}>Educational Assessment</Text>
            <Text style={styles.scoringInfoText}>
              Your work will be evaluated on budget management, material selection, cost efficiency, sustainability, and
              technical accuracy.
            </Text>
            <TouchableOpacity style={styles.viewRubricButton} onPress={showRubricInfo}>
              <Ionicons name="information-circle-outline" size={16} color="#176BB7" />
              <Text style={styles.viewRubricText}>View Scoring Rubric</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveEstimateButton, isSaving && styles.saveEstimateButtonDisabled]}
            onPress={saveEstimate}
            disabled={isSaving}
          >
            <Text style={styles.saveEstimateButtonText}>
              {isSaving ? "Saving & Calculating Score..." : "Save & Get Assessment"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#176BB7" />
          <Text style={styles.loadingText}>Loading design plan...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cost Estimation</Text>
        <TouchableOpacity onPress={showRubricInfo} style={styles.rubricButton}>
          <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Plan Name and Description */}
          <View style={styles.planHeader}>
            <Text style={styles.planName}>
              {planDetails?.title || planDetails?.plan_name || "Untitled Design Plan"}
            </Text>
            <Text style={styles.planDescription}>
              {planDetails?.description || "No description available for this design plan."}
            </Text>

            <View style={styles.planMetadata}>
              {floorArea > 0 && (
                <View style={styles.metadataBadge}>
                  <Ionicons name="resize-outline" size={16} color="#1E4F91" />
                  <Text style={styles.metadataText}>Area: {floorArea} sq.m</Text>
                </View>
              )}
              {planDetails?.difficulty_level && (
                <View style={styles.metadataBadge}>
                  <Ionicons name="school-outline" size={16} color="#1E4F91" />
                  <Text style={styles.metadataText}>Level: {planDetails.difficulty_level}</Text>
                </View>
              )}
              {planDetails?.estimated_duration && (
                <View style={styles.metadataBadge}>
                  <Ionicons name="time-outline" size={16} color="#1E4F91" />
                  <Text style={styles.metadataText}>Duration: {planDetails.estimated_duration} min</Text>
                </View>
              )}
            </View>

            {/* Learning Objectives */}
            {planDetails?.learning_objectives && planDetails.learning_objectives.length > 0 && (
              <View style={styles.objectivesSection}>
                <Text style={styles.objectivesTitle}>Learning Objectives</Text>
                {planDetails.learning_objectives.map((objective, index) => (
                  <View key={index} style={styles.objectiveItem}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                    <Text style={styles.objectiveText}>{objective}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Completion Status Banner */}
          {isCompleted && completionData && (
            <View style={styles.completionBanner}>
              <View style={styles.completionHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.completionTitle}>Design Plan Completed!</Text>
              </View>
              <Text style={styles.completionSubtitle}>
                Completed on {new Date(completionData.completed_at).toLocaleDateString()}
              </Text>
              <View style={styles.completionStats}>
                <View style={styles.completionStat}>
                  <Text style={styles.completionStatLabel}>Final Score</Text>
                  <Text style={styles.completionStatValue}>
                    {completionData.final_score}/100 ({completionData.letter_grade})
                  </Text>
                </View>
                <View style={styles.completionStat}>
                  <Text style={styles.completionStatLabel}>Total Cost</Text>
                  <Text style={styles.completionStatValue}>{formatCurrency(completionData.total_cost, currency)}</Text>
                </View>
                <View style={styles.completionStat}>
                  <Text style={styles.completionStatLabel}>Budget Used</Text>
                  <Text style={styles.completionStatValue}>{completionData.budget_utilization}%</Text>
                </View>
              </View>
              {/* Materials Summary in Completion Banner */}
              {completionData && selectedMaterials.length > 0 && (
                <View style={styles.completionMaterialsSection}>
                  <Text style={styles.completionMaterialsTitle}>Materials Selected</Text>
                  <View style={styles.completionMaterialsList}>
                    {selectedMaterials.slice(0, 5).map((material, index) => (
                      <View key={index} style={styles.completionMaterialItem}>
                        <Text style={styles.completionMaterialName} numberOfLines={1}>
                          {material.material_name}
                        </Text>
                        <Text style={styles.completionMaterialDetails}>
                          {material.quantity} × {formatCurrency(material.price, currency)}
                        </Text>
                      </View>
                    ))}
                    {selectedMaterials.length > 5 && (
                      <Text style={styles.completionMaterialsMore}>
                        +{selectedMaterials.length - 5} more materials
                      </Text>
                    )}
                  </View>

                  <View style={styles.completionCostBreakdown}>
                    <View style={styles.completionCostRow}>
                      <Text style={styles.completionCostLabel}>Total Materials:</Text>
                      <Text style={styles.completionCostValue}>{selectedMaterials.length} items</Text>
                    </View>
                    <View style={styles.completionCostRow}>
                      <Text style={styles.completionCostLabel}>Materials Cost:</Text>
                      <Text style={styles.completionCostValue}>{formatCurrency(totalEstimatedCost, currency)}</Text>
                    </View>
                    <View style={styles.completionCostRow}>
                      <Text style={styles.completionCostLabel}>Cost per sq.m:</Text>
                      <Text style={styles.completionCostValue}>
                        {formatCurrency(totalEstimatedCost / (floorArea || 1), currency)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              <TouchableOpacity style={styles.viewResultsButton} onPress={() => setIsFeedbackModalVisible(true)}>
                <Text style={styles.viewResultsButtonText}>View Detailed Results</Text>
                <Ionicons name="arrow-forward" size={16} color="#176BB7" />
              </TouchableOpacity>
            </View>
          )}

          {/* Design File Section */}
          <View style={styles.fileSection}>
            <Text style={styles.sectionTitle}>Design Plan Preview</Text>

            {imageLoading ? (
              <ActivityIndicator size="small" color="#176BB7" />
            ) : designImage ? (
              <TouchableOpacity
                onPress={() => setIsImageModalVisible(true)}
                style={{ alignItems: "center", marginVertical: 12 }}
              >
                <Image
                  source={{ uri: designImage }}
                  style={{ width: 300, height: 200, borderRadius: 8, backgroundColor: "#ccc" }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Tap to view full size</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: "gray" }}>No design image available.</Text>
            )}
          </View>

          {/* Progress Tracking Section */}
          <View style={styles.progressTrackingSection}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <Text style={styles.sectionSubtitle}>Track your progress through the design plan</Text>

            <View style={styles.progressTrackingContent}>
              <ProgressBar progress={currentProgress} totalSteps={progressSteps.length} />
              <ProgressSteps steps={progressSteps} currentStep={currentProgress} onStepPress={handleStepPress} />
            </View>

            <TouchableOpacity style={styles.completeStepButton} onPress={completeCurrentStep}>
              <Text style={styles.completeStepButtonText}>
                {currentProgress < progressSteps.length - 1
                  ? `Complete ${progressSteps[currentProgress].label}`
                  : "Finalize Estimate"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            {savingProgress && (
              <View style={styles.savingIndicator}>
                <ActivityIndicator size="small" color="#176BB7" />
                <Text style={styles.savingText}>Saving your progress...</Text>
              </View>
            )}
          </View>

          {/* Budget Status Card */}
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetTitle}>Budget Status</Text>
              <View style={styles.budgetBadge}>
                <Text style={styles.budgetBadgeText}>{formatCurrency(budget, currency)}</Text>
              </View>
            </View>

            <Text style={styles.budgetSubtitle}>Assigned budget from instructor</Text>

            <View style={styles.budgetDetails}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Estimated Cost:</Text>
                <Text style={[styles.budgetSpent, { color: budgetStatus.color }]}>
                  {formatCurrency(totalEstimatedCost, currency)}
                </Text>
              </View>

              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Remaining:</Text>
                <Text style={[styles.budgetRemaining, remaining < 0 && { color: "#FF6B6B" }]}>
                  {formatCurrency(remaining, currency)}
                </Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.min(spentPercentage, 100)}%` },
                  spentPercentage > 90 && styles.progressBarWarning,
                  spentPercentage > 100 && styles.progressBarDanger,
                ]}
              />
            </View>

            <View style={styles.budgetStatusRow}>
              <View
                style={[
                  styles.budgetStatusBadge,
                  { backgroundColor: budgetStatus.color + "20", borderColor: budgetStatus.color },
                ]}
              >
                <Text style={[styles.budgetStatusText, { color: budgetStatus.color }]}>{budgetStatus.message}</Text>
              </View>

              {optimizationTips.length > 0 && (
                <TouchableOpacity
                  style={styles.optimizeTipsButton}
                  onPress={() => setShowOptimizationTips(!showOptimizationTips)}
                >
                  <Ionicons name="bulb-outline" size={18} color="#FFB347" />
                  <Text style={styles.optimizeTipsText}>
                    {showOptimizationTips ? "Hide Tips" : "Optimization Tips"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {showOptimizationTips && optimizationTips.length > 0 && (
              <View style={styles.optimizationTips}>
                {optimizationTips.map((tip, index) => renderOptimizationTip(tip, index))}
              </View>
            )}
          </View>

          {/* Materials Section */}
          <View style={styles.materialsSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Materials Selection</Text>
              <Text style={styles.sectionSubtitle}>Select materials and specify quantities</Text>
            </View>

            {materialsLoading ? (
              <View style={styles.materialsLoading}>
                <ActivityIndicator size="small" color="#176BB7" />
                <Text style={styles.loadingText}>Loading materials...</Text>
              </View>
            ) : materialsError ? (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={32} color="#FF6B6B" />
                <Text style={styles.errorStateText}>{materialsError}</Text>
                <TouchableOpacity
                  style={styles.retryMaterialsButton}
                  onPress={() => {
                    if (planDetails?.teacher_id) {
                      fetchMaterials(planDetails.teacher_id)
                    } else {
                      fetchTeacherIdFromClass(classId)
                    }
                  }}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : materials.length > 0 ? (
              <>
                <View style={styles.materialFilterContainer}>
                  <Text style={styles.selectedCountText}>{selectedMaterials.length} materials selected</Text>
                  <TouchableOpacity
                    style={styles.clearSelectionButton}
                    onPress={() => {
                      const clearedMaterials = materials.map((m) => ({ ...m, isSelected: false, quantity: 0 }))
                      setMaterials(clearedMaterials)
                      setSelectedMaterials([])
                    }}
                  >
                    <Text style={styles.clearSelectionText}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={materials}
                  renderItem={renderMaterialItem}
                  keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                  scrollEnabled={false}
                  contentContainerStyle={styles.materialsList}
                />
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="construct-outline" size={32} color="#B4D4FF" />
                <Text style={styles.emptyStateText}>No materials have been added by the instructor yet</Text>
              </View>
            )}
          </View>

          {/* Selected Materials Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Materials Summary</Text>

            <View style={styles.summaryTable}>
              <View style={styles.summaryTableHeader}>
                <Text style={[styles.summaryTableCell, styles.summaryTableMaterial]}>Material</Text>
                <Text style={[styles.summaryTableCell, styles.summaryTableQty]}>Qty</Text>
                <Text style={[styles.summaryTableCell, styles.summaryTablePrice]}>Price</Text>
                <Text style={[styles.summaryTableCell, styles.summaryTableTotal]}>Total</Text>
                <Text style={[styles.summaryTableCell, styles.summaryTableCategory]}>Category</Text>
              </View>

              {selectedMaterials.map((material, index) => (
                <View key={index} style={styles.summaryTableRow}>
                  <Text style={[styles.summaryTableCell, styles.summaryTableMaterial]} numberOfLines={1}>
                    {material.material_name}
                  </Text>
                  <Text style={[styles.summaryTableCell, styles.summaryTableQty]}>{material.quantity}</Text>
                  <Text style={[styles.summaryTableCell, styles.summaryTablePrice]}>
                    {formatCurrency(material.price, currency)}
                  </Text>
                  <Text style={[styles.summaryTableCell, styles.summaryTableTotal]}>
                    {formatCurrency(material.price * material.quantity, currency)}
                  </Text>
                  <Text style={[styles.summaryTableCell, styles.summaryTableCategory]}>{material.category || "—"}</Text>
                </View>
              ))}

              <View style={styles.summaryTableFooter}>
                <Text style={[styles.summaryTableCell, styles.summaryTableMaterial]}>Total Estimated Cost</Text>
                <Text style={[styles.summaryTableCell, styles.summaryTableTotal, styles.summaryTableTotalValue]}>
                  {formatCurrency(totalEstimatedCost, currency)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isCompleted ? (
              <>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setIsFeedbackModalVisible(true)}>
                  <Text style={styles.primaryButtonText}>View Assessment Results</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                  <Text style={styles.secondaryButtonText}>Back to Design Plans</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {selectedMaterials.length > 0 && (
                  <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEstimateModalVisible(true)}>
                    <Text style={styles.primaryButtonText}>Save Cost Estimate & Get Score</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={selectedMaterials.length > 0 ? styles.secondaryButton : styles.primaryButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={selectedMaterials.length > 0 ? styles.secondaryButtonText : styles.primaryButtonText}>
                    {selectedMaterials.length > 0 ? "Cancel" : "Go Back"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modals and Image Viewer */}
      {renderSaveEstimateModal()}
      {renderFeedbackModal()}
      {renderRubricModal()}
      <ImageViewing
        images={[{ uri: designImage }]}
        imageIndex={0}
        visible={isImageModalVisible}
        onRequestClose={() => setIsImageModalVisible(false)}
        swipeToCloseEnabled={true}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF5FF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF5FF",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#176BB7",
    height: 60,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
    marginLeft: 16,
  },
  rubricButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  planHeader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E4F91",
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    marginBottom: 12,
  },
  planMetadata: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  metadataBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  metadataText: {
    fontSize: 12,
    color: "#1E4F91",
    marginLeft: 4,
  },
  objectivesSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F8FAFF",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  objectivesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E4F91",
    marginBottom: 8,
  },
  objectiveItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  objectiveText: {
    fontSize: 13,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  budgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E4F91",
  },
  budgetBadge: {
    backgroundColor: "#B4D4FF",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  budgetBadgeText: {
    color: "#1E4F91",
    fontWeight: "600",
    fontSize: 14,
  },
  budgetSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  budgetDetails: {
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: "#666",
  },
  budgetSpent: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  budgetRemaining: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#B4D4FF",
  },
  progressBarWarning: {
    backgroundColor: "#FFB347",
  },
  progressBarDanger: {
    backgroundColor: "#FF6B6B",
  },
  budgetStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  budgetStatusText: {
    fontWeight: "600",
    fontSize: 14,
  },
  optimizeTipsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFB347",
  },
  optimizeTipsText: {
    color: "#FFB347",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  optimizationTips: {
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE0B2",
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  tipSavings: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
  },
  fileSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E4F91",
    marginBottom: 4,
  },
  sectionTitleRow: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  materialsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  materialsLoading: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  materialFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectedCountText: {
    fontSize: 14,
    color: "#666",
  },
  clearSelectionButton: {
    backgroundColor: "#FFE0E0",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  clearSelectionText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  materialsList: {
    paddingBottom: 8,
  },
  materialItem: {
    backgroundColor: "#F8FAFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  selectedMaterialItem: {
    borderColor: "#B4D4FF",
    backgroundColor: "#F0F7FF",
  },
  materialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  materialSelectButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  materialPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#176BB7",
  },
  materialDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    marginLeft: 32,
  },
  quantityContainer: {
    backgroundColor: "#EEF5FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    marginLeft: 32,
  },
  quantityLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  quantityButton: {
    backgroundColor: "#FFFFFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B4D4FF",
  },
  quantityInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#B4D4FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    width: 80,
    textAlign: "center",
    fontSize: 16,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#176BB7",
    textAlign: "right",
  },
  materialFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  materialUnit: {
    fontSize: 14,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFF",
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  errorStateText: {
    fontSize: 14,
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  retryMaterialsButton: {
    backgroundColor: "#EEF5FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#1E4F91",
    fontWeight: "600",
    fontSize: 14,
  },
  summarySection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTable: {
    marginTop: 12,
  },
  summaryTableHeader: {
    flexDirection: "row",
    backgroundColor: "#EEF5FF",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  summaryTableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  summaryTableFooter: {
    flexDirection: "row",
    backgroundColor: "#F8FAFF",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  summaryTableCell: {
    fontSize: 14,
  },
  summaryTableMaterial: {
    flex: 2,
    fontWeight: "500",
  },
  summaryTableQty: {
    flex: 0.5,
    textAlign: "center",
  },
  summaryTablePrice: {
    flex: 1,
    textAlign: "right",
  },
  summaryTableTotal: {
    flex: 1,
    textAlign: "right",
  },
  summaryTableTotalValue: {
    fontWeight: "700",
    color: "#176BB7",
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#176BB7",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#EEF5FF",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#176BB7",
    fontWeight: "600",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#B4D4FF",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E4F91",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  estimateNameInput: {
    backgroundColor: "#F8FAFF",
    borderWidth: 1,
    borderColor: "#B4D4FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  estimateSummary: {
    backgroundColor: "#F8FAFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  estimateSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E4F91",
    marginBottom: 12,
  },
  estimateSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  estimateSummaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  estimateSummaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  scoringInfo: {
    backgroundColor: "#E8F0FC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  scoringInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E4F91",
    marginBottom: 8,
  },
  scoringInfoText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 8,
  },
  viewRubricButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewRubricText: {
    fontSize: 13,
    color: "#176BB7",
    fontWeight: "600",
    marginLeft: 4,
  },
  saveEstimateButton: {
    backgroundColor: "#176BB7",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveEstimateButtonDisabled: {
    backgroundColor: "#B4D4FF",
  },
  saveEstimateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  // Progress tracking styles
  progressTrackingSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTrackingContent: {
    marginTop: 16,
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 12,
  },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 24,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  completedStep: {
    backgroundColor: "#4CAF50",
  },
  currentStep: {
    backgroundColor: "#176BB7",
  },
  futureStep: {
    backgroundColor: "#E0E0E0",
  },
  stepNumber: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  stepLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    maxWidth: 80,
  },
  currentStepLabel: {
    color: "#176BB7",
    fontWeight: "600",
  },
  stepConnector: {
    position: "absolute",
    top: 15,
    right: "-50%",
    width: "100%",
    height: 2,
    backgroundColor: "#E0E0E0",
    zIndex: -1,
  },
  completedConnector: {
    backgroundColor: "#4CAF50",
  },
  completeStepButton: {
    backgroundColor: "#176BB7",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  completeStepButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  savingIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  savingText: {
    fontSize: 14,
    color: "#176BB7",
    marginLeft: 8,
  },

  // Enhanced feedback modal styles
  scoreSection: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: "#F0F7FF",
    borderRadius: 8,
  },
  scoreSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E4F91",
    marginBottom: 12,
  },
  scoreDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#176BB7",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scoreMax: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  gradeInfo: {
    alignItems: "center",
  },
  gradeBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  gradeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  classComparison: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  scoreBreakdownSection: {
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: "#F8FAFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#176BB7",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  categoryScoreContainer: {
    alignItems: "flex-end",
  },
  categoryScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#176BB7",
  },
  categoryLevel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
  },
  categoryProgressContainer: {
    color: "#176BB7",
  },
  categoryLevel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
  },
  categoryProgressContainer: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  categoryProgress: {
    height: "100%",
    borderRadius: 3,
  },
  progressHigh: {
    backgroundColor: "#4CAF50",
  },
  progressMedium: {
    backgroundColor: "#FFB347",
  },
  progressLow: {
    backgroundColor: "#FF6B6B",
  },
  categoryFeedback: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  strengthsSection: {
    marginBottom: 20,
  },
  strengthItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  strengthText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginLeft: 12,
  },
  improvementSection: {
    marginBottom: 20,
  },
  improvementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  improvementText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginLeft: 12,
  },
  educationalSection: {
    marginBottom: 20,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F7FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginLeft: 12,
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginLeft: 12,
  },
  closeModalButton: {
    backgroundColor: "#176BB7",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  closeModalButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  // Rubric modal styles
  rubricCategory: {
    marginBottom: 20,
    backgroundColor: "#F8FAFF",
    borderRadius: 8,
    padding: 12,
  },
  rubricCategoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E4F91",
    marginBottom: 12,
  },
  rubricCriterion: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#B4D4FF",
  },
  rubricCriterionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  rubricLevel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#176BB7",
  },
  rubricRange: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#EEF5FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rubricDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  summaryTableCategory: {
    flex: 1.2,
    textAlign: "right",
  },
  completionBanner: {
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  completionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E7D32",
    marginLeft: 8,
  },
  completionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  completionStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  completionStat: {
    flex: 1,
    alignItems: "center",
  },
  completionStatLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  completionStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
    textAlign: "center",
  },
  viewResultsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  viewResultsButtonText: {
    color: "#176BB7",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 8,
  },
  completionMaterialsSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  completionMaterialsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 12,
  },
  completionMaterialsList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  completionMaterialItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  completionMaterialName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  completionMaterialDetails: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  completionMaterialsMore: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  completionCostBreakdown: {
    backgroundColor: "#F8FFF8",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E8F5E8",
  },
  completionCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  completionCostLabel: {
    fontSize: 14,
    color: "#666",
  },
  completionCostValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
})

export default DesignPlanDetails