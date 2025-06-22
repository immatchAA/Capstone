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
import { supabase } from '../supabaseClient';

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
    }
  }, [error])

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
          shadowColor: glowAnimation.interpolate({
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
      </BlurView>
    </Animated.View>
  )
}

const EnhancedUserLogin = ({ navigation }) => {
  const { width, height, fontScale } = useWindowDimensions()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({ email: "", password: "" })

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const buttonAnim = useRef(new Animated.Value(0)).current
  const logoAnim = useRef(new Animated.Value(0)).current
  const particleAnims = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

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

    // Clear form on focus
    const unsubscribe = navigation.addListener("focus", () => {
      setEmail("")
      setPassword("")
      setErrors({ email: "", password: "" })
    })

    return unsubscribe
  }, [navigation])

  const startContinuousAnimations = () => {
    // Particle animation
    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 300),
          Animated.timing(anim, {
            toValue: 1,
            duration: 4000 + index * 200,
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
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }

  const handleLogin = async () => {
    let isValid = true
    const newErrors = { email: "", password: "" }

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
    }

    setErrors(newErrors)

    if (isValid) {
      setIsLoading(true)

      // Haptic feedback
      if (Platform.OS === "ios") {
        Vibration.vibrate(10)
      }

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Replace with actual Supabase authentication
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          alert('Login failed: ' + error.message);
          return;
        }
        
        const { user } = data;
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          alert('Error fetching user profile: ' + profileError.message);
          return;
        }
        
        if (userProfile.role !== 'student' && userProfile.role !== 'Student') {
          alert('Access denied. Only students can log in.');
          await supabase.auth.signOut();
        } else {
          navigation.navigate('MainTabs');
        }
        

        // For demo purposes
        navigation.navigate("MainLanding")
      } catch (error) {
        alert("An unexpected error occurred. Please try again.")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({
        ...errors,
        email: "Please enter your email to reset password",
      })
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({
        ...errors,
        email: "Please enter a valid email address",
      })
      return
    }

    setIsLoading(true)

    try {
      // Replace with actual Supabase call
      // const { error } = await supabase.auth.resetPasswordForEmail(email);
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Password reset email sent! Please check your inbox.")
    } catch (error) {
      alert("An unexpected error occurred. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderParticles = () => {
    return particleAnims.map((anim, index) => (
      <Animated.View
        key={index}
        style={[
          styles.particle,
          {
            left: `${10 + index * 12}%`,
            top: `${20 + index * 8}%`,
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -150],
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

            {/* Header */}
            <Animated.View
              style={[
                styles.headerContainer,
                {
                  opacity: logoAnim,
                  transform: [{ scale: logoAnim }],
                  marginTop: getResponsiveSpacing(isLandscape ? 20 : 40),
                  marginBottom: getResponsiveSpacing(40),
                },
              ]}
            >
              <View style={styles.logoWrapper}>
                <LinearGradient colors={["#FF6B6B", "#4ECDC4", "#45B7D1"]} style={styles.logoGradient}>
                  <Ionicons name="business-outline" size={getResponsiveSize(40)} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={[styles.title, { fontSize: getResponsiveSize(32) }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { fontSize: getResponsiveSize(16) }]}>
                Sign in to continue your architectural journey
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

              {/* Forgot Password */}
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
                <Text style={[styles.forgotPasswordText, { fontSize: getResponsiveSize(14) }]}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Animated.View style={[styles.buttonContainer, { opacity: buttonAnim }]}>
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    {
                      paddingVertical: getResponsiveSpacing(18),
                    },
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#FF6B6B", "#FF8E53"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="log-in-outline" size={24} color="#FFFFFF" />
                        <Text style={[styles.buttonText, { fontSize: getResponsiveSize(18) }]}>Sign In</Text>
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

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={[styles.signUpText, { fontSize: getResponsiveSize(16) }]}>Don't have an account yet?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("UserRegister")}
                  style={[
                    styles.signUpButton,
                    {
                      paddingVertical: getResponsiveSpacing(12),
                      paddingHorizontal: getResponsiveSpacing(20),
                    },
                  ]}
                >
                  <BlurView intensity={30} style={styles.signUpButtonBlur}>
                    <Text style={[styles.signUpButtonText, { fontSize: getResponsiveSize(16) }]}>Create Account</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[styles.footer, { opacity: fadeAnim, marginTop: getResponsiveSpacing(40) }]}>
              <BlurView intensity={20} style={styles.footerBlur}>
                <Text style={[styles.footerText, { fontSize: getResponsiveSize(12) }]}>
                  By signing in, you agree to our Terms of Service and Privacy Policy
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
    width: 100,
    height: 100,
    top: "10%",
    right: "5%",
    borderRadius: 50,
  },
  shape2: {
    width: 80,
    height: 80,
    top: "70%",
    left: "10%",
    borderRadius: 40,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
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
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: -15,
    marginBottom: 15,
    marginLeft: 5,
    fontWeight: "500",
  },

  // Forgot password
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#4ECDC4",
    fontWeight: "600",
  },

  // Button
  buttonContainer: {
    marginBottom: 20,
  },
  loginButton: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#FF6B6B",
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

  // Sign up
  signUpContainer: {
    alignItems: "center",
  },
  signUpText: {
    color: "#FFFFFF",
    marginBottom: 15,
    opacity: 0.9,
  },
  signUpButton: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  signUpButtonBlur: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  signUpButtonText: {
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

export default EnhancedUserLogin
