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

  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)

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
        // If there are saved cost estimates, load them
        if (data.cost_estimates) {
          // Update selected materials based on saved cost estimates
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

  //Design File Image

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

  // Save estimate
  const saveEstimate = async () => {
    if (!estimateName.trim()) {
      Alert.alert("Error", "Please provide a name for this estimate")
      return
    }

    setIsSaving(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        Alert.alert("Error", "You must be logged in to save estimates")
        setIsSaving(false)
        return
      }

      // Calculate score based on various factors
      const scoreData = calculateDesignScore(
        totalEstimatedCost,
        planDetails?.budget || 300000,
        planDetails || {},
        selectedMaterials,
      )

      // Create estimate record
      const { data: estimate, error: estimateError } = await supabase
        .from("cost_estimates")
        .insert({
          name: estimateName,
          design_plan_id: planDetails?.id,
          student_id: user.id,
          total_cost: totalEstimatedCost,
          status: "completed", // Changed from "draft" to "completed"
          class_id: classId,
          score: scoreData.overallScore, // Add the score
           // Add score breakdown
          // completed_at field removed as it doesn't exist in the database
        })
        .select()
        .single()

      if (estimateError) {
        console.error("Error saving estimate:", estimateError)
        Alert.alert("Error", `Failed to save estimate: ${estimateError.message}`)
        setIsSaving(false)
        return
      }

      // Save selected materials
      const estimateItems = selectedMaterials.map((material) => ({
        estimate_id: estimate.id,
        material_id: material.id,
        quantity: material.quantity,
        unit_price: material.price,
        total_price: material.price * material.quantity,
      }))

      const { error: itemsError } = await supabase.from("cost_estimate_items").insert(estimateItems)

      if (itemsError) {
        console.error("Error saving estimate items:", itemsError)
        Alert.alert("Warning", `Estimate saved but items failed: ${itemsError.message}`)
      } else {
        // Update progress to final step
        updateProgress(progressSteps.length - 1)

        // Generate educational feedback
        const feedback = generateEducationalFeedback(scoreData)

        // Complete the design plan
        const completionResult = completeDesignPlan(scoreData)

        // Show completion dialog with score
        showCompletionDialog(scoreData, feedback, completionResult.recommendations)

        setIsEstimateModalVisible(false)

        // Update the design plan status in the database
        try {
          const { error: updateError } = await supabase
            .from("student_progress")
            .update({
              is_completed: true,
              completed_at: new Date().toISOString(),
            })
            .eq("student_id", userId)
            .eq("id", planDetails.id)

          if (updateError) {
            console.error("Error updating design plan status:", updateError)
          }
        } catch (err) {
          console.error("Exception updating design plan status:", err)
        }
      }
    } catch (err) {
      console.error("Exception in saveEstimate:", err)
      Alert.alert("Error", "An unexpected error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate design score based on multiple architectural factors
  const calculateDesignScore = (totalCost, budget, plan, materials) => {
    // Use default values if parameters are null
    budget = budget || 300000
    plan = plan || {}
    materials = materials || []

    // Initialize score categories
    const scoreData = {
      overallScore: 0,
      categories: {
        budgetManagement: {
          score: 0,
          maxScore: 30,
          description: "Budget utilization and cost control",
        },
        materialSelection: {
          score: 0,
          maxScore: 25,
          description: "Appropriate material choices and quantities",
        },
        costEfficiency: {
          score: 0,
          maxScore: 25,
          description: "Cost per square meter efficiency",
        },
        sustainability: {
          score: 0,
          maxScore: 20,
          description: "Use of sustainable materials and practices",
        },
      },
    }

    // 1. Budget Management Score (30 points)
    const budgetRatio = totalCost / budget
    if (budgetRatio <= 0.85) {
      // Well under budget (excellent)
      scoreData.categories.budgetManagement.score = 30
    } else if (budgetRatio <= 0.95) {
      // Slightly under budget (very good)
      scoreData.categories.budgetManagement.score = 25
    } else if (budgetRatio <= 1.0) {
      // At budget (good)
      scoreData.categories.budgetManagement.score = 20
    } else if (budgetRatio <= 1.1) {
      // Slightly over budget (acceptable)
      scoreData.categories.budgetManagement.score = 15
    } else if (budgetRatio <= 1.2) {
      // Moderately over budget (poor)
      scoreData.categories.budgetManagement.score = 10
    } else {
      // Significantly over budget (very poor)
      scoreData.categories.budgetManagement.score = 5
    }

    // 2. Material Selection Score (25 points)
    // Check if essential materials are included
    const essentialMaterials = ["cement", "steel", "sand", "gravel", "wood", "tile", "paint"]
    const selectedMaterialNames = materials.map((m) => m.material_name.toLowerCase())

    let essentialCount = 0
    essentialMaterials.forEach((material) => {
      if (selectedMaterialNames.some((name) => name.includes(material))) {
        essentialCount++
      }
    })

    const essentialRatio = essentialCount / essentialMaterials.length
    scoreData.categories.materialSelection.score = Math.round(essentialRatio * 25)

    // 3. Cost Efficiency Score (25 points)
    // Calculate cost per square meter and compare to industry standards
    const costPerSqm = totalCost / (plan.floor_area || floorArea || 100)

    // Industry standards (simplified for this example)
    // These would typically vary by region and building type
    const lowCostStandard = 15000 // PHP per sqm
    const highCostStandard = 30000 // PHP per sqm

    if (costPerSqm <= lowCostStandard) {
      // Very efficient
      scoreData.categories.costEfficiency.score = 25
    } else if (costPerSqm <= (lowCostStandard + highCostStandard) / 2) {
      // Moderately efficient
      scoreData.categories.costEfficiency.score = 20
    } else if (costPerSqm <= highCostStandard) {
      // Standard efficiency
      scoreData.categories.costEfficiency.score = 15
    } else if (costPerSqm <= highCostStandard * 1.2) {
      // Somewhat inefficient
      scoreData.categories.costEfficiency.score = 10
    } else {
      // Very inefficient
      scoreData.categories.costEfficiency.score = 5
    }

    // 4. Sustainability Score (20 points)
    // Check for sustainable materials
    const sustainableMaterials = ["bamboo", "recycled", "sustainable", "eco", "green"]
    let sustainableCount = 0

    selectedMaterialNames.forEach((name) => {
      if (sustainableMaterials.some((sustainable) => name.includes(sustainable))) {
        sustainableCount++
      }
    })

    // Award points based on percentage of sustainable materials
    const sustainableRatio = sustainableCount / (materials.length || 1)
    scoreData.categories.sustainability.score = Math.min(20, Math.round(sustainableRatio * 40))

    // Calculate overall score
    scoreData.overallScore = Object.values(scoreData.categories).reduce((total, category) => total + category.score, 0)

    return scoreData
  }

  // Generate educational feedback based on score
  const generateEducationalFeedback = (scoreData) => {
    const feedback = []

    // Budget Management Feedback
    if (scoreData.categories.budgetManagement.score >= 25) {
      feedback.push("Excellent budget management! Your cost estimation demonstrates strong financial planning skills.")
    } else if (scoreData.categories.budgetManagement.score >= 15) {
      feedback.push("Acceptable budget management. Consider reviewing high-cost items to optimize your budget further.")
    } else {
      feedback.push(
        "Your project is significantly over budget. In professional practice, this would require redesign or client approval for additional funding.",
      )
    }

    // Material Selection Feedback
    if (scoreData.categories.materialSelection.score >= 20) {
      feedback.push("Your material selection is comprehensive and appropriate for this type of construction.")
    } else if (scoreData.categories.materialSelection.score >= 10) {
      feedback.push(
        "Some essential materials may be missing or underrepresented in your estimate. Review structural and finishing requirements.",
      )
    } else {
      feedback.push(
        "Your material selection needs significant improvement. Many essential components are missing from your estimate.",
      )
    }

    // Cost Efficiency Feedback
    if (scoreData.categories.costEfficiency.score >= 20) {
      feedback.push("Your cost per square meter is highly efficient, demonstrating good value engineering principles.")
    } else if (scoreData.categories.costEfficiency.score >= 10) {
      feedback.push("Your cost per square meter is within acceptable ranges but could be optimized further.")
    } else {
      feedback.push(
        "Your cost per square meter is high compared to industry standards. Consider alternative materials or construction methods.",
      )
    }

    // Sustainability Feedback
    if (scoreData.categories.sustainability.score >= 15) {
      feedback.push(
        "Excellent incorporation of sustainable materials! This would qualify for green building certifications.",
      )
    } else if (scoreData.categories.sustainability.score >= 8) {
      feedback.push(
        "Some sustainable materials are included, but there's room to improve the environmental impact of your design.",
      )
    } else {
      feedback.push(
        "Consider incorporating more sustainable materials to reduce environmental impact and potentially reduce long-term costs.",
      )
    }

    // Add educational context
    feedback.push(
      "In professional practice, architects typically aim for a 5-10% contingency buffer below the maximum budget.",
    )
    feedback.push(
      "Material costs typically represent 60-70% of total construction costs, with labor making up most of the remainder.",
    )

    return feedback
  }

  // Complete the design plan and generate recommendations
  const completeDesignPlan = (scoreData) => {
    const recommendations = []

    // Generate recommendations based on scores
    if (scoreData.categories.budgetManagement.score < 20) {
      recommendations.push("Review high-cost materials and consider alternatives or quantity reductions.")
    }

    if (scoreData.categories.materialSelection.score < 20) {
      recommendations.push(
        "Ensure all essential building components are included in your estimate (foundation, structure, roofing, finishes, etc).",
      )
    }

    if (scoreData.categories.costEfficiency.score < 20) {
      recommendations.push(
        "Consider value engineering techniques to optimize cost per square meter without sacrificing quality.",
      )
    }

    if (scoreData.categories.sustainability.score < 15) {
      recommendations.push("Research locally available sustainable materials that could replace conventional options.")
    }

    // Add general educational recommendations
    recommendations.push("Compare your estimate with similar projects to benchmark your cost estimation accuracy.")
    recommendations.push(
      "Consider life-cycle costs, not just initial construction costs, for a more comprehensive analysis.",
    )

    return {
      completed: true,
      recommendations,
    }
  }

  // Show completion dialog with score and feedback
  const showCompletionDialog = (scoreData, feedback, recommendations) => {
    // Create a formatted message for the alert
    const scoreMessage = `Your Design Plan Score: ${scoreData.overallScore}/100\n\n`

    const breakdownMessage = Object.entries(scoreData.categories)
      .map(([key, data]) => `${data.description}: ${data.score}/${data.maxScore}`)
      .join("\n")

    // Show the completion alert
    Alert.alert("Design Plan Completed!", `${scoreMessage}${breakdownMessage}`, [
      {
        text: "View Detailed Feedback",
        onPress: () => showDetailedFeedback(scoreData, feedback, recommendations),
      },
      {
        text: "OK",
        style: "default",
      },
    ])
  }

  // Show detailed feedback in a modal
  const showDetailedFeedback = (scoreData, feedback, recommendations) => {
    // Create a state for the feedback modal
    setFeedbackData({
      score: scoreData,
      feedback,
      recommendations,
    })
    setIsFeedbackModalVisible(true)
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

  // Feedback Modal
  const renderFeedbackModal = () => (
    <Modal
      visible={isFeedbackModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsFeedbackModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: height * 0.8 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Design Plan Assessment</Text>
            <TouchableOpacity onPress={() => setIsFeedbackModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {feedbackData && (
              <>
                <View style={styles.scoreSection}>
                  <Text style={styles.scoreSectionTitle}>Overall Score</Text>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreValue}>{feedbackData.score.overallScore}</Text>
                    <Text style={styles.scoreMax}>/100</Text>
                  </View>
                </View>

                <View style={styles.scoreBreakdownSection}>
                  <Text style={styles.scoreSectionTitle}>Score Breakdown</Text>
                  {Object.entries(feedbackData.score.categories).map(([key, data], index) => (
                    <View key={index} style={styles.scoreBreakdownItem}>
                      <View style={styles.scoreBreakdownHeader}>
                        <Text style={styles.scoreBreakdownTitle}>{data.description}</Text>
                        <Text style={styles.scoreBreakdownValue}>
                          {data.score}/{data.maxScore}
                        </Text>
                      </View>
                      <View style={styles.scoreProgressContainer}>
                        <View
                          style={[
                            styles.scoreProgress,
                            { width: `${(data.score / data.maxScore) * 100}%` },
                            data.score / data.maxScore < 0.4
                              ? styles.scoreProgressLow
                              : data.score / data.maxScore < 0.7
                                ? styles.scoreProgressMedium
                                : styles.scoreProgressHigh,
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.feedbackSection}>
                  <Text style={styles.scoreSectionTitle}>Educational Feedback</Text>
                  {feedbackData.feedback.map((item, index) => (
                    <View key={index} style={styles.feedbackItem}>
                      <Ionicons name="school-outline" size={20} color="#176BB7" />
                      <Text style={styles.feedbackText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.recommendationsSection}>
                  <Text style={styles.scoreSectionTitle}>Recommendations</Text>
                  {feedbackData.recommendations.map((item, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Ionicons name="bulb-outline" size={20} color="#FFB347" />
                      <Text style={styles.recommendationText}>{item}</Text>
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

  const { height } = Dimensions.get("window")

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
          <Text style={styles.modalSubtitle}>Give this estimate a name to save it for later</Text>

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
          </View>

          <TouchableOpacity
            style={[styles.saveEstimateButton, isSaving && styles.saveEstimateButtonDisabled]}
            onPress={saveEstimate}
            disabled={isSaving}
          >
            <Text style={styles.saveEstimateButtonText}>{isSaving ? "Saving..." : "Save Estimate"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cost Estimation</Text>
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

            {floorArea > 0 && (
              <View style={styles.floorAreaBadge}>
                <Ionicons name="grid-outline" size={16} color="#1E4F91" />
                <Text style={styles.floorAreaText}>Floor Area: {floorArea} sq.m</Text>
              </View>
            )}
          </View>

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
          {selectedMaterials.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Materials Summary</Text>

              <View style={styles.summaryTable}>
                <View style={styles.summaryTableHeader}>
                  <Text style={[styles.summaryTableCell, styles.summaryTableMaterial]}>Material</Text>
                  <Text style={[styles.summaryTableCell, styles.summaryTableQty]}>Qty</Text>
                  <Text style={[styles.summaryTableCell, styles.summaryTablePrice]}>Price</Text>
                  <Text style={[styles.summaryTableCell, styles.summaryTableTotal]}>Total</Text>
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
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {selectedMaterials.length > 0 && (
              <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEstimateModalVisible(true)}>
                <Text style={styles.primaryButtonText}>Save Cost Estimate</Text>
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
          </View>
        </View>
      </ScrollView>

      {renderSaveEstimateModal()}
      <ImageViewing
        images={[{ uri: designImage }]}
        imageIndex={0}
        visible={isImageModalVisible}
        onRequestClose={() => setIsImageModalVisible(false)}
      />

      <ImageViewing
        images={[{ uri: designImage }]}
        imageIndex={0}
        visible={isImageModalVisible}
        onRequestClose={() => setIsImageModalVisible(false)}
        swipeToCloseEnabled={true}
      />
      {renderFeedbackModal()}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#176BB7",
    height: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 16,
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
  floorAreaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  floorAreaText: {
    fontSize: 14,
    color: "#1E4F91",
    marginLeft: 4,
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
  budgetButton: {
    borderWidth: 1,
    borderColor: "#1E4F91",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  budgetButtonText: {
    color: "#1E4F91",
    fontWeight: "600",
    fontSize: 14,
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
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  fileButtonText: {
    color: "#176BB7",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  fileUrl: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
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
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF5FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    color: "#176BB7",
    marginLeft: 4,
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
  retryButtonText: {
    color: "#1E4F91",
    fontWeight: "600",
    fontSize: 14,
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
  progressBarContainer: {
    height: 24,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
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

  // Feedback modal styles
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
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#176BB7",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
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
  scoreBreakdownSection: {
    marginBottom: 20,
  },
  scoreBreakdownItem: {
    marginBottom: 12,
  },
  scoreBreakdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scoreBreakdownTitle: {
    fontSize: 14,
    color: "#333",
  },
  scoreBreakdownValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#176BB7",
  },
  scoreProgressContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreProgress: {
    height: "100%",
    borderRadius: 4,
  },
  scoreProgressLow: {
    backgroundColor: "#FF6B6B",
  },
  scoreProgressMedium: {
    backgroundColor: "#FFB347",
  },
  scoreProgressHigh: {
    backgroundColor: "#4CAF50",
  },
  feedbackSection: {
    marginBottom: 20,
  },
  feedbackItem: {
    flexDirection: "row",
    backgroundColor: "#F8FAFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  feedbackText: {
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
})

export default DesignPlanDetails
