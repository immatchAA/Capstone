"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
  useWindowDimensions,
  Vibration,
  Easing,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import { supabase } from "../supabaseClient"

// Add this debugging helper function
const checkSupabaseConfig = async () => {
  try {
    console.log("🔧 Checking Supabase configuration...")

    // Test basic connection
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("❌ Supabase config error:", error)
      return false
    }

    console.log("✅ Supabase configuration is working")
    return true
  } catch (error) {
    console.error("💥 Supabase config check failed:", error)
    return false
  }
}

const AnimatedInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  rightIcon,
  error,
  autoCapitalize = "none",
  icon,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const animatedValue = useRef(new Animated.Value(0)).current
  const shakeAnimation = useRef(new Animated.Value(0)).current
  const glowAnimation = useRef(new Animated.Value(0)).current
  const successAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: isFocused || value ? 1 : 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(glowAnimation, {
        toValue: isFocused ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start()
  }, [isFocused, value])

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start()
    } else if (value && !error) {
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(successAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [error, value])

  const handleFocus = () => {
    setIsFocused(true)
    onFocus && onFocus()
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur && onBlur()
  }

  return (
    <Animated.View
      style={[
        styles.inputWrapper,
        {
          transform: [{ translateX: shakeAnimation }],
          shadowColor: error
            ? "#FF6B6B"
            : glowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["transparent", "#4ECDC4"],
              }),
          shadowOpacity: glowAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.3],
          }),
          shadowRadius: glowAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          }),
          elevation: glowAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 8],
          }),
        },
      ]}
    >
      <BlurView intensity={30} style={[styles.inputContainer, error && styles.inputError]}>
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <Animated.Text
          style={[
            styles.floatingLabel,
            {
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -25],
                  }),
                },
                {
                  scale: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.8],
                  }),
                },
              ],
              color: error
                ? "#FF6B6B"
                : animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["#FFFFFF80", "#4ECDC4"],
                  }),
            },
          ]}
        >
          {label}
        </Animated.Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          style={[styles.input, icon && styles.inputWithIcon]}
          autoCapitalize={autoCapitalize}
          placeholderTextColor="transparent"
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        <Animated.View
          style={[
            styles.successIndicator,
            {
              opacity: successAnimation,
              transform: [{ scale: successAnimation }],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        </Animated.View>
      </BlurView>
    </Animated.View>
  )
}

const PasswordStrengthIndicator = ({ password }) => {
  const [strength, setStrength] = useState(0)
  const strengthAnim = useRef(new Animated.Value(0)).current

  const requirements = [
    { test: (pwd) => pwd.length >= 8, label: "At least 8 characters" },
    { test: (pwd) => /[A-Z]/.test(pwd), label: "One uppercase letter" },
    { test: (pwd) => /[a-z]/.test(pwd), label: "One lowercase letter" },
    { test: (pwd) => /\d/.test(pwd), label: "One number" },
    { test: (pwd) => /[@$!%*?&#]/.test(pwd), label: "One special character" },
  ]

  useEffect(() => {
    const newStrength = requirements.filter((req) => req.test(password)).length
    setStrength(newStrength)

    Animated.timing(strengthAnim, {
      toValue: newStrength / requirements.length,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [password])

  const getStrengthColor = () => {
    if (strength <= 2) return "#FF6B6B"
    if (strength <= 3) return "#FFA726"
    if (strength <= 4) return "#66BB6A"
    return "#4CAF50"
  }

  const getStrengthText = () => {
    if (strength <= 2) return "Weak"
    if (strength <= 3) return "Fair"
    if (strength <= 4) return "Good"
    return "Strong"
  }

  if (!password) return null

  return (
    <BlurView intensity={20} style={styles.strengthContainer}>
      <View style={styles.strengthHeader}>
        <Text style={styles.strengthTitle}>Password Strength</Text>
        <Text style={[styles.strengthText, { color: getStrengthColor() }]}>{getStrengthText()}</Text>
      </View>
      <View style={styles.strengthBar}>
        <Animated.View
          style={[
            styles.strengthFill,
            {
              width: strengthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: getStrengthColor(),
            },
          ]}
        />
      </View>
      <View style={styles.requirementsList}>
        {requirements.map((req, index) => (
          <Animated.View
            key={index}
            style={[
              styles.requirement,
              {
                opacity: req.test(password) ? 1 : 0.5,
              },
            ]}
          >
            <Ionicons
              name={req.test(password) ? "checkmark-circle" : "ellipse-outline"}
              size={16}
              color={req.test(password) ? "#4CAF50" : "#FFFFFF60"}
            />
            <Text
              style={[
                styles.requirementText,
                {
                  color: req.test(password) ? "#4CAF50" : "#FFFFFF60",
                },
              ]}
            >
              {req.label}
            </Text>
          </Animated.View>
        ))}
      </View>
    </BlurView>
  )
}

const EnhancedUserRegister = ({ navigation }) => {
  const { width, height, fontScale } = useWindowDimensions()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const buttonAnim = useRef(new Animated.Value(0)).current
  const logoAnim = useRef(new Animated.Value(0)).current
  const particleAnims = useRef(Array.from({ length: 10 }, () => new Animated.Value(0))).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  // Responsive calculations
  const isTablet = width >= 768
  const isLandscape = width > height
  const isSmallDevice = width < 375

  const getResponsiveSize = (baseSize) => {
    const deviceMultiplier = isTablet ? 1.3 : isSmallDevice ? 0.85 : 1
    return (baseSize * deviceMultiplier) / fontScale
  }

  const getResponsiveSpacing = (baseSpacing) => {
    const deviceMultiplier = isTablet ? 1.5 : isSmallDevice ? 0.8 : 1
    return baseSpacing * deviceMultiplier
  }

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.spring(logoAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 120,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      startContinuousAnimations()
    })
  }, [])

  useEffect(() => {
    // Update progress based on form completion
    const fields = [firstName, lastName, email, password, confirmPassword]
    const completedFields = fields.filter((field) => field.length > 0).length
    const progress = completedFields / fields.length

    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [firstName, lastName, email, password, confirmPassword])

  const startContinuousAnimations = () => {
    // Particle animation
    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + index * 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    })

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }

  const validatePassword = (password) => {
    const errors = []
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Include at least 1 uppercase letter")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Include at least 1 lowercase letter")
    }
    if (!/\d/.test(password)) {
      errors.push("Include at least 1 number")
    }
    if (!/[@$!%*?&#]/.test(password)) {
      errors.push("Include at least 1 special character")
    }
    return errors
  }

  const handleSignUp = async () => {
    let isValid = true

    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    }

    if (!firstName) {
      newErrors.firstName = "First Name is required"
      isValid = false
    }

    if (!lastName) {
      newErrors.lastName = "Last Name is required"
      isValid = false
    }

    if (!email) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    }

    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    } else {
      const passwordErrors = validatePassword(password)
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors[0]
        isValid = false
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)

    if (isValid) {
      setIsLoading(true)

      // Haptic feedback
      if (Platform.OS === "ios") {
        Vibration.vibrate(10)
      }

      try {
        console.log("🚀 Starting registration process...")
        console.log("📧 Email:", email.toLowerCase().trim())
        console.log("👤 Name:", firstName.trim(), lastName.trim())

        // Step 1: Check Supabase connection
        const { data: connectionTest, error: connectionError } = await supabase.from("users").select("count").limit(1)

        if (connectionError) {
          console.error("❌ Supabase connection failed:", connectionError)
          alert("Database connection failed. Please check your internet connection and try again.")
          return
        }

        console.log("✅ Supabase connection successful")

        // Step 2: Sign up the user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              role: "student",
            },
          },
        })

        console.log("🔐 Auth response:", { authData, authError })

        if (authError) {
          console.error("❌ Auth Error:", authError)

          // Handle specific auth errors
          if (authError.message.includes("User already registered")) {
            alert("An account with this email already exists. Please try signing in instead.")
          } else if (authError.message.includes("Password should be at least")) {
            alert("Password is too weak. Please use a stronger password.")
          } else if (authError.message.includes("Invalid email")) {
            alert("Please enter a valid email address.")
          } else {
            alert("Registration failed: " + authError.message)
          }
          return
        }

        if (!authData.user) {
          console.error("❌ No user data returned from auth")
          alert("Registration failed: Unable to create user account")
          return
        }

        console.log("✅ User created in auth:", authData.user.id)
        console.log("📧 Email confirmed:", authData.user.email_confirmed_at ? "Yes" : "No")

        // Step 3: Wait a moment for auth to process
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Step 4: Insert user profile into users table
        const userProfile = {
          id: authData.user.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.toLowerCase().trim(),
          role: "student",
          
        }

        console.log("👤 Inserting user profile:", userProfile)

        const { data: profileData, error: profileError } = await supabase.from("users").insert(userProfile).select()

        console.log("📝 Profile insert response:", { profileData, profileError })

        if (profileError) {
          console.error("❌ Profile Error:", profileError)

          // Handle specific profile errors
          if (profileError.code === "23505") {
            console.log("ℹ️ User profile already exists, this might be okay")
          } else if (profileError.message.includes("permission denied")) {
            alert("Database permission error. Please contact support.")
            return
          } else {
            // If profile creation fails, clean up the auth user
            console.log("🧹 Cleaning up auth user due to profile error...")
            await supabase.auth.signOut()
            alert("Failed to create user profile: " + profileError.message)
            return
          }
        } else {
          console.log("✅ User profile created successfully:", profileData)
        }

        // Step 5: Verify the user was actually created
        const { data: verifyUser, error: verifyError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.user.id)
          .single()

        console.log("🔍 User verification:", { verifyUser, verifyError })

        if (verifyError && verifyError.code !== "PGRST116") {
          console.error("❌ User verification failed:", verifyError)
        } else if (verifyUser) {
          console.log("✅ User verified in database:", verifyUser)
        }

        // Step 6: Check if email confirmation is required
        if (authData.user && !authData.user.email_confirmed_at) {
          alert(
            "Registration successful! 🎉\n\nPlease check your email to verify your account before signing in.\n\nCheck your spam folder if you don't see the email.",
          )
        } else {
          alert("Registration successful! 🎉\n\nYou can now sign in to your account.")
        }

        console.log("✅ Registration process completed successfully")

        // Navigate to login screen
        navigation.navigate("UserLogin")
      } catch (error) {
        console.error("💥 Unexpected error:", error)
        console.error("Error stack:", error.stack)
        alert("An unexpected error occurred. Please try again.\n\nError: " + error.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Add this useEffect to check config on component mount
  useEffect(() => {
    checkSupabaseConfig()
  }, [])

  const renderParticles = () => {
    return particleAnims.map((anim, index) => (
      <Animated.View
        key={index}
        style={[
          styles.particle,
          {
            left: `${5 + index * 10}%`,
            top: `${15 + index * 7}%`,
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -120],
                }),
              },
              {
                scale: anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
              },
            ],
          },
        ]}
      />
    ))
  }

  const renderDecorativeElements = () => (
    <>
      <Animated.View
        style={[
          styles.decorativeShape,
          styles.shape1,
          {
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeShape,
          styles.shape2,
          {
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["360deg", "0deg"],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeShape,
          styles.shape3,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
    </>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient colors={["#667eea", "#764ba2", "#f093fb"]} style={styles.gradient}>
        {renderDecorativeElements()}
        {renderParticles()}

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContainer,
              {
                paddingHorizontal: getResponsiveSpacing(20),
                paddingTop: getResponsiveSpacing(Platform.OS === "android" ? 60 : 40),
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <BlurView intensity={30} style={styles.backButtonBlur}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </BlurView>
            </TouchableOpacity>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <BlurView intensity={20} style={styles.progressBlur}>
                <Text style={[styles.progressText, { fontSize: getResponsiveSize(12) }]}>Registration Progress</Text>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>
              </BlurView>
            </View>

            {/* Header */}
            <Animated.View
              style={[
                styles.headerContainer,
                {
                  opacity: logoAnim,
                  transform: [{ scale: logoAnim }],
                  marginTop: getResponsiveSpacing(20),
                  marginBottom: getResponsiveSpacing(30),
                },
              ]}
            >
              <View style={styles.logoWrapper}>
                <LinearGradient colors={["#FF6B6B", "#4ECDC4", "#45B7D1"]} style={styles.logoGradient}>
                  <Ionicons name="person-add-outline" size={getResponsiveSize(40)} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={[styles.title, { fontSize: getResponsiveSize(28) }]}>Create Account</Text>
              <Text style={[styles.subtitle, { fontSize: getResponsiveSize(16) }]}>
                Join ARchiQuest to explore architecture
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                  maxWidth: isTablet ? 400 : "100%",
                  alignSelf: "center",
                  width: "100%",
                },
              ]}
            >
              <AnimatedInput
                label="First Name"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text)
                  if (errors.firstName) setErrors({ ...errors, firstName: "" })
                }}
                error={errors.firstName}
                autoCapitalize="words"
                icon={<Ionicons name="person-outline" size={20} color="#4ECDC4" />}
              />
              {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}

              <AnimatedInput
                label="Last Name"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text)
                  if (errors.lastName) setErrors({ ...errors, lastName: "" })
                }}
                error={errors.lastName}
                autoCapitalize="words"
                icon={<Ionicons name="person-outline" size={20} color="#4ECDC4" />}
              />
              {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}

              <AnimatedInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  if (errors.email) setErrors({ ...errors, email: "" })
                }}
                keyboardType="email-address"
                error={errors.email}
                icon={<Ionicons name="mail-outline" size={20} color="#4ECDC4" />}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              <AnimatedInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  if (errors.password) setErrors({ ...errors, password: "" })
                }}
                secureTextEntry={!showPassword}
                error={errors.password}
                icon={<Ionicons name="lock-closed-outline" size={20} color="#4ECDC4" />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#FFFFFF80" />
                  </TouchableOpacity>
                }
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

              <PasswordStrengthIndicator password={password} />

              <AnimatedInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text)
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" })
                }}
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
                icon={<Ionicons name="lock-closed-outline" size={20} color="#4ECDC4" />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#FFFFFF80"
                    />
                  </TouchableOpacity>
                }
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

              {/* Register Button */}
              <Animated.View style={[styles.buttonContainer, { opacity: buttonAnim }]}>
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    {
                      paddingVertical: getResponsiveSpacing(18),
                    },
                  ]}
                  onPress={handleSignUp}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#4ECDC4", "#45B7D1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="person-add-outline" size={24} color="#FFFFFF" />
                        <Text style={[styles.buttonText, { fontSize: getResponsiveSize(18) }]}>Create Account</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Divider */}
              <View style={[styles.dividerContainer, { marginVertical: getResponsiveSpacing(30) }]}>
                <LinearGradient
                  colors={["transparent", "#FFFFFF40", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerLine}
                />
                <BlurView intensity={20} style={styles.dividerTextContainer}>
                  <Text style={[styles.dividerText, { fontSize: getResponsiveSize(14) }]}>OR</Text>
                </BlurView>
                <LinearGradient
                  colors={["transparent", "#FFFFFF40", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dividerLine}
                />
              </View>

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={[styles.signInText, { fontSize: getResponsiveSize(16) }]}>Already have an account?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("UserLogin")}
                  style={[
                    styles.signInButton,
                    {
                      paddingVertical: getResponsiveSpacing(12),
                      paddingHorizontal: getResponsiveSpacing(20),
                    },
                  ]}
                >
                  <BlurView intensity={30} style={styles.signInButtonBlur}>
                    <Text style={[styles.signInButtonText, { fontSize: getResponsiveSize(16) }]}>Sign In</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[styles.footer, { opacity: fadeAnim, marginTop: getResponsiveSpacing(40) }]}>
              <BlurView intensity={20} style={styles.footerBlur}>
                <Text style={[styles.footerText, { fontSize: getResponsiveSize(12) }]}>
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </Text>
              </BlurView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },

  // Decorative elements
  decorativeShape: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  shape1: {
    width: 120,
    height: 120,
    top: "8%",
    right: "5%",
    borderRadius: 60,
  },
  shape2: {
    width: 80,
    height: 80,
    top: "75%",
    left: "8%",
    borderRadius: 40,
  },
  shape3: {
    width: 60,
    height: 60,
    top: "45%",
    right: "15%",
    borderRadius: 30,
  },
  particle: {
    position: "absolute",
    width: 3,
    height: 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 1.5,
  },

  // Back button
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? 60 : 40,
    left: 20,
    zIndex: 10,
    borderRadius: 25,
    overflow: "hidden",
  },
  backButtonBlur: {
    padding: 12,
  },

  // Progress bar
  progressContainer: {
    marginTop: Platform.OS === "android" ? 100 : 80,
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  progressBlur: {
    padding: 15,
  },
  progressText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ECDC4",
    borderRadius: 2,
  },

  // Header
  headerContainer: {
    alignItems: "center",
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    fontWeight: "400",
  },

  // Form
  formContainer: {
    width: "100%",
  },
  inputWrapper: {
    marginBottom: 20,
    borderRadius: 15,
  },
  inputContainer: {
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    position: "relative",
    overflow: "hidden",
  },
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 2,
  },
  floatingLabel: {
    position: "absolute",
    left: 50,
    top: 20,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    fontSize: 16,
    color: "#FFFFFF",
    paddingLeft: 30,
    paddingTop: 5,
  },
  inputWithIcon: {
    paddingLeft: 30,
  },
  inputIcon: {
    position: "absolute",
    left: 20,
    top: 20,
  },
  rightIcon: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  successIndicator: {
    position: "absolute",
    right: 50,
    top: 20,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: -15,
    marginBottom: 15,
    marginLeft: 5,
    fontWeight: "500",
  },

  // Password strength
  strengthContainer: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  strengthTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  strengthText: {
    fontSize: 14,
    fontWeight: "700",
  },
  strengthBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 15,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  requirementsList: {
    padding: 15,
    paddingTop: 10,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "500",
  },

  // Button
  buttonContainer: {
    marginBottom: 20,
  },
  registerButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 12,
    letterSpacing: 1,
  },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerTextContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    overflow: "hidden",
  },
  dividerText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Sign in
  signInContainer: {
    alignItems: "center",
  },
  signInText: {
    color: "#FFFFFF",
    marginBottom: 15,
    opacity: 0.9,
  },
  signInButton: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  signInButtonBlur: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  footerBlur: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    overflow: "hidden",
  },
  footerText: {
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.8,
  },
})

export default EnhancedUserRegister
