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
  TextInput,
  Modal,
  Animated,
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

      // Create estimate record
      const { data: estimate, error: estimateError } = await supabase
        .from("cost_estimates")
        .insert({
          name: estimateName,
          design_plan_id: planDetails.id,
          student_id: user.id,
          total_cost: totalEstimatedCost,
          status: "draft",
          class_id: classId,
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
        Alert.alert("Success", "Your cost estimate has been saved successfully!", [
          { text: "OK", onPress: () => setIsEstimateModalVisible(false) },
        ])

        // Update progress to materials step if not already there
        if (currentProgress < 1) {
          updateProgress(1)
        }
      }
    } catch (err) {
      console.error("Exception in saveEstimate:", err)
      Alert.alert("Error", "An unexpected error occurred while saving")
    } finally {
      setIsSaving(false)
    }
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

  // Find alternative materials (cheaper options)
  const findAlternatives = (material) => {
    // Group materials by similar names or categories
    const similarMaterials = materials.filter(
      (m) =>
        m.id !== material.id &&
        (m.material_name.toLowerCase().includes(material.material_name.toLowerCase().split(" ")[0]) ||
          material.material_name.toLowerCase().includes(m.material_name.toLowerCase().split(" ")[0])),
    )

    // Sort by price
    return similarMaterials.sort((a, b) => a.price - b.price)
  }

  // Generate optimization tips
  const generateOptimizationTips = () => {
    const budget = planDetails?.budget || 300000
    const tips = []

    // If over budget, suggest alternatives
    if (totalEstimatedCost > budget) {
      // Find the most expensive materials
      const expensiveMaterials = [...selectedMaterials]
        .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
        .slice(0, 3)

      expensiveMaterials.forEach((material) => {
        const alternatives = findAlternatives(material)
        if (alternatives.length > 0) {
          const cheapestAlt = alternatives[0]
          const savings = (material.price - cheapestAlt.price) * material.quantity

          if (savings > 0) {
            tips.push({
              type: "alternative",
              material: material,
              alternative: cheapestAlt,
              savings: savings,
            })
          }
        }
      })
    }

    // Check for quantity optimization
    selectedMaterials.forEach((material) => {
      // For area-based materials, check if there's waste
      if (
        (material.unit.toLowerCase().includes("sqm") || material.unit.toLowerCase().includes("sq.m")) &&
        material.quantity > floorArea * 1.1
      ) {
        tips.push({
          type: "quantity",
          material: material,
          suggestedQuantity: Math.ceil(floorArea * 1.05), // 5% waste allowance
          savings: material.price * (material.quantity - Math.ceil(floorArea * 1.05)),
        })
      }
    })

    return tips
  }

  // Render a single material item
  const renderMaterialItem = ({ item, index }) => (
    <View style={[styles.materialItem, item.isSelected && styles.selectedMaterialItem]}>
      <View style={styles.materialHeader}>
        <TouchableOpacity style={styles.materialSelectButton} onPress={() => handleSelectMaterial(item, index)}>
          <Ionicons
            name={item.isSelected ? "checkbox" : "square-outline"}
            size={24}
            color={item.isSelected ? "#176BB7" : "#666"}
          />
          <Text style={styles.materialName}>{item.material_name}</Text>
        </TouchableOpacity>
        <Text style={styles.materialPrice}>
          {formatCurrency(item.price, planDetails?.currency)} / {item.unit}
        </Text>
      </View>

      {item.description && <Text style={styles.materialDescription}>{item.description}</Text>}

      {item.isSelected && (
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                if (item.quantity > 1) {
                  handleQuantityChange((item.quantity - 1).toString(), index)
                }
              }}
            >
              <Ionicons name="remove" size={20} color="#176BB7" />
            </TouchableOpacity>

            <TextInput
              style={styles.quantityInput}
              value={item.quantity.toString()}
              onChangeText={(text) => handleQuantityChange(text, index)}
              keyboardType="numeric"
              selectTextOnFocus
            />

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange((item.quantity + 1).toString(), index)}
            >
              <Ionicons name="add" size={20} color="#176BB7" />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemTotal}>
            Total: {formatCurrency(item.price * item.quantity, planDetails?.currency)}
          </Text>
        </View>
      )}

      <View style={styles.materialFooter}>
        <Text style={styles.materialUnit}>Unit: {item.unit}</Text>
        {!item.isSelected && (
          <TouchableOpacity style={styles.addButton} onPress={() => handleSelectMaterial(item, index)}>
            <Ionicons name="add-circle-outline" size={20} color="#176BB7" />
            <Text style={styles.addButtonText}>Add to Estimate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  // Render optimization tip
  const renderOptimizationTip = (tip, index) => {
    if (tip.type === "alternative") {
      return (
        <View key={index} style={styles.tipItem}>
          <Ionicons name="swap-horizontal" size={24} color="#FFB347" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Consider a cheaper alternative</Text>
            <Text style={styles.tipDescription}>
              Replace "{tip.material.material_name}" ({formatCurrency(tip.material.price, planDetails?.currency)}/
              {tip.material.unit}) with "{tip.alternative.material_name}" (
              {formatCurrency(tip.alternative.price, planDetails?.currency)}/{tip.alternative.unit})
            </Text>
            <Text style={styles.tipSavings}>
              Potential savings: {formatCurrency(tip.savings, planDetails?.currency)}
            </Text>
          </View>
        </View>
      )
    } else if (tip.type === "quantity") {
      return (
        <View key={index} style={styles.tipItem}>
          <Ionicons name="resize" size={24} color="#4CAF50" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Optimize quantity</Text>
            <Text style={styles.tipDescription}>
              Reduce "{tip.material.material_name}" from {tip.material.quantity} to {tip.suggestedQuantity}{" "}
              {tip.material.unit}
            </Text>
            <Text style={styles.tipSavings}>
              Potential savings: {formatCurrency(tip.savings, planDetails?.currency)}
            </Text>
          </View>
        </View>
      )
    }
    return null
  }

  // Save Estimate Modal
  const renderSaveEstimateModal = () => (
    <Modal
      visible={isEstimateModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsEstimateModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Save Cost Estimate</Text>
            <TouchableOpacity onPress={() => setIsEstimateModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>Give your estimate a name to save it for future reference</Text>

          <TextInput
            style={styles.estimateNameInput}
            placeholder="Estimate Name (e.g. First Floor Materials)"
            value={estimateName}
            onChangeText={setEstimateName}
            autoFocus
          />

          <View style={styles.estimateSummary}>
            <Text style={styles.estimateSummaryTitle}>Summary</Text>
            <View style={styles.estimateSummaryRow}>
              <Text style={styles.estimateSummaryLabel}>Materials:</Text>
              <Text style={styles.estimateSummaryValue}>{selectedMaterials.length} items</Text>
            </View>
            <View style={styles.estimateSummaryRow}>
              <Text style={styles.estimateSummaryLabel}>Total Cost:</Text>
              <Text style={styles.estimateSummaryValue}>
                {formatCurrency(totalEstimatedCost, planDetails?.currency)}
              </Text>
            </View>
            <View style={styles.estimateSummaryRow}>
              <Text style={styles.estimateSummaryLabel}>Budget:</Text>
              <Text style={styles.estimateSummaryValue}>
                {formatCurrency(planDetails?.budget || 0, planDetails?.currency)}
              </Text>
            </View>
            <View style={styles.estimateSummaryRow}>
              <Text style={styles.estimateSummaryLabel}>Status:</Text>
              <Text style={[styles.estimateSummaryValue, { color: getBudgetStatus().color }]}>
                {getBudgetStatus().message}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveEstimateButton, isSaving && styles.saveEstimateButtonDisabled]}
            onPress={saveEstimate}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveEstimateButtonText}>Save Estimate</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#176BB7" />
      </View>
    )
  }

  if (error || !planDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>{error || "Failed to load design plan"}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => (route.params?.planId ? fetchPlanDetails(route.params.planId) : handleGoBack())}
          >
            <Text style={styles.retryButtonText}>{route.params?.planId ? "Retry" : "Go Back"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Calculate remaining budget and percentage
  const budget = planDetails.budget || 300000
  const currency = planDetails.currency || "PHP"
  const remaining = budget - totalEstimatedCost
  const spentPercentage = (totalEstimatedCost / budget) * 100
  const budgetStatus = getBudgetStatus()
  const optimizationTips = generateOptimizationTips()

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
            <Text style={styles.planName}>{planDetails.title || planDetails.plan_name || "Untitled Design Plan"}</Text>
            <Text style={styles.planDescription}>
              {planDetails.description || "No description available for this design plan."}
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
                    if (planDetails.teacher_id) {
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
})

export default DesignPlanDetails
