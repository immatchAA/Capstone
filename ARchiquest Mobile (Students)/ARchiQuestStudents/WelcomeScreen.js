"use client"

import { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Animated,
  Platform,
  useWindowDimensions,
  Easing,
  Vibration,
  ScrollView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"

const EnhancedWelcomeScreen = ({ navigation }) => {
  const { width, height, fontScale } = useWindowDimensions()

  // Device type detection
  const isTablet = width >= 768
  const isLandscape = width > height
  const isSmallDevice = width < 375
  const isLargeDevice = width > 414

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const buttonAnim = useRef(new Animated.Value(0)).current
  const logoAnim = useRef(new Animated.Value(0)).current
  const floatingAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const particleAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  // Interactive states
  const [isPressed, setIsPressed] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [showParticles, setShowParticles] = useState(false)

  // Responsive calculations
  const getResponsiveSize = (baseSize, scaleFactor = 1) => {
    const deviceMultiplier = isTablet ? 1.3 : isSmallDevice ? 0.85 : 1
    const orientationMultiplier = isLandscape && !isTablet ? 0.9 : 1
    return (baseSize * deviceMultiplier * orientationMultiplier * scaleFactor) / fontScale
  }

  const getResponsiveSpacing = (baseSpacing) => {
    const deviceMultiplier = isTablet ? 1.5 : isSmallDevice ? 0.8 : 1
    const orientationMultiplier = isLandscape ? 0.7 : 1
    return baseSpacing * deviceMultiplier * orientationMultiplier
  }

  // Dynamic sizing based on screen dimensions
  const logoSize = getResponsiveSize(isTablet ? 100 : 80)
  const logoTextSize = getResponsiveSize(isTablet ? 36 : 28)
  const welcomeTextSize = getResponsiveSize(isTablet ? 64 : isLandscape ? 40 : 48)
  const descriptionTextSize = getResponsiveSize(isTablet ? 20 : 16)
  const subtitleSize = getResponsiveSize(isTablet ? 20 : 16)
  const buttonTextSize = getResponsiveSize(isTablet ? 22 : 18)
  const featureTextSize = getResponsiveSize(isTablet ? 16 : 12)
  const featureIconSize = getResponsiveSize(isTablet ? 32 : 24)

  // Dynamic spacing
  const containerPadding = getResponsiveSpacing(20)
  const sectionSpacing = getResponsiveSpacing(isLandscape ? 20 : 40)
  const buttonHeight = getResponsiveSpacing(isTablet ? 60 : 50)
  const featureCardSize = getResponsiveSpacing(isTablet ? 120 : 90)

  // Layout configurations
  const contentMaxWidth = isTablet ? Math.min(width * 0.8, 600) : width - containerPadding * 2
  const buttonMaxWidth = isTablet ? Math.min(contentMaxWidth * 0.6, 400) : contentMaxWidth * 0.85
  const featureContainerLayout = isLandscape && !isTablet ? "row" : isTablet ? "row" : "row"

  useEffect(() => {
    // Enhanced entrance animations
    Animated.sequence([
      // Logo entrance with bounce
      Animated.spring(logoAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Content slide in with stagger
      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200,
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
        // Buttons with elastic entrance
        Animated.spring(buttonAnim, {
          toValue: 1,
          tension: 120,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Start continuous animations
      startContinuousAnimations()
      startParticleAnimation()
    })
  }, [])

  const startContinuousAnimations = () => {
    // Floating animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Pulse animation for features
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

    // Rotation animation for decorative elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }

  const startParticleAnimation = () => {
    setShowParticles(true)
    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 500),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + index * 200,
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
  }

  const handleButtonPress = (action) => {
    // Haptic feedback
    if (Platform.OS === "ios") {
      Vibration.vibrate(10)
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start()

    // Navigate after animation
    setTimeout(() => {
      navigation.navigate(action)
    }, 200)
  }

  const handleFeaturePress = (index) => {
    setSelectedFeature(index)

    // Haptic feedback
    if (Platform.OS === "ios") {
      Vibration.vibrate(5)
    }

    // Feature selection animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    // Reset selection after delay
    setTimeout(() => setSelectedFeature(null), 1000)
  }

  const features = [
    { icon: "cube-outline", text: "3D Models", color: "#FF6B6B" },
    { icon: "school-outline", text: "Learn", color: "#4ECDC4" },
    { icon: "glasses-outline", text: "AR View", color: "#45B7D1" },
  ]

  const renderParticles = () => {
    if (!showParticles) return null

    return particleAnims.map((anim, index) => (
      <Animated.View
        key={index}
        style={[
          styles.particle,
          {
            left: `${20 + index * 15}%`,
            top: `${30 + index * 10}%`,
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -100],
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

  const renderDecorativeElements = () => {
    const shapeSize1 = getResponsiveSpacing(isTablet ? 120 : 80)
    const shapeSize2 = getResponsiveSpacing(isTablet ? 90 : 60)
    const shapeSize3 = getResponsiveSpacing(isTablet ? 60 : 40)

    return (
      <>
        {/* Floating geometric shapes */}
        <Animated.View
          style={[
            styles.decorativeShape,
            {
              width: shapeSize1,
              height: shapeSize1,
              borderRadius: shapeSize1 / 2,
              top: isLandscape ? "10%" : "15%",
              right: isTablet ? "15%" : "10%",
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
            {
              width: shapeSize2,
              height: shapeSize2,
              borderRadius: shapeSize2 / 2,
              top: isLandscape ? "50%" : "60%",
              left: isTablet ? "10%" : "5%",
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
            {
              width: shapeSize3,
              height: shapeSize3,
              borderRadius: shapeSize3 / 2,
              top: isLandscape ? "70%" : "80%",
              right: isTablet ? "25%" : "20%",
              transform: [
                {
                  scale: pulseAnim,
                },
              ],
            },
          ]}
        />
      </>
    )
  }

  const ContentWrapper = isLandscape && !isTablet ? ScrollView : View

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background decorative elements */}
        {renderDecorativeElements()}
        {renderParticles()}

        {/* Main content */}
        <ContentWrapper
          style={[
            styles.content,
            {
              paddingHorizontal: containerPadding,
              paddingTop: Platform.OS === "android" ? getResponsiveSpacing(60) : getResponsiveSpacing(40),
              paddingBottom: getResponsiveSpacing(20), // Add bottom padding
              maxWidth: isTablet ? contentMaxWidth : undefined,
              alignSelf: isTablet ? "center" : "stretch",
            },
          ]}
          contentContainerStyle={
            isLandscape && !isTablet
              ? {
                  flexGrow: 1,
                  paddingBottom: getResponsiveSpacing(40), // Add padding for ScrollView
                }
              : undefined
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Logo Section */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                marginTop: getResponsiveSpacing(isLandscape ? 10 : 20),
                marginBottom: getResponsiveSpacing(isLandscape ? 20 : sectionSpacing),
                opacity: logoAnim,
                transform: [
                  { scale: logoAnim },
                  {
                    translateY: floatingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.logoWrapper}>
              <LinearGradient
                colors={["#FF6B6B", "#4ECDC4", "#45B7D1"]}
                style={[
                  styles.logoGradient,
                  {
                    width: logoSize,
                    height: logoSize,
                    borderRadius: logoSize / 2,
                  },
                ]}
              >
                <Ionicons name="business-outline" size={logoSize * 0.5} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={[styles.logoText, { fontSize: logoTextSize }]}>ARchiQuest</Text>
            <View
              style={[
                styles.logoUnderline,
                {
                  width: getResponsiveSpacing(isTablet ? 80 : 60),
                  height: getResponsiveSpacing(3),
                },
              ]}
            />
          </Animated.View>

          {/* Enhanced Greeting Section */}
          <Animated.View
            style={[
              styles.greetingContainer,
              {
                marginBottom: getResponsiveSpacing(isLandscape ? 20 : sectionSpacing),
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.welcomeText, { fontSize: welcomeTextSize }]}>Explore</Text>
            <Text style={[styles.welcomeTextSecondary, { fontSize: welcomeTextSize }]}>Architecture</Text>
            <View
              style={[
                styles.descriptionWrapper,
                {
                  marginTop: getResponsiveSpacing(20),
                  paddingHorizontal: getResponsiveSpacing(isTablet ? 20 : 10),
                },
              ]}
            >
              <Text
                style={[
                  styles.descriptionText,
                  {
                    fontSize: descriptionTextSize,
                    lineHeight: descriptionTextSize * 1.6,
                  },
                ]}
              >
                Discover architectural structures, building materials, and construction principles through immersive AR
                experiences
              </Text>
            </View>
          </Animated.View>

          {/* Enhanced Subtitle */}
          <Animated.View
            style={[
              styles.subtitleContainer,
              {
                opacity: fadeAnim,
                marginBottom: getResponsiveSpacing(isLandscape ? 20 : sectionSpacing),
                paddingHorizontal: getResponsiveSpacing(20),
              },
            ]}
          >
            <LinearGradient
              colors={["transparent", "#FFFFFF40", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subtitleLine}
            />
            <BlurView
              intensity={20}
              style={[
                styles.subtitleBlur,
                {
                  paddingHorizontal: getResponsiveSpacing(20),
                  paddingVertical: getResponsiveSpacing(8),
                },
              ]}
            >
              <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>Begin Your Journey</Text>
            </BlurView>
            <LinearGradient
              colors={["transparent", "#FFFFFF40", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subtitleLine}
            />
          </Animated.View>

          {/* Enhanced Buttons */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonAnim,
                transform: [{ scale: scaleAnim }],
                marginBottom: getResponsiveSpacing(isLandscape ? 20 : sectionSpacing),
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  width: buttonMaxWidth,
                  marginBottom: getResponsiveSpacing(15),
                },
              ]}
              onPress={() => handleButtonPress("UserLogin")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF6B6B", "#FF8E53"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.buttonGradient,
                  {
                    paddingVertical: getResponsiveSpacing(18),
                    paddingHorizontal: getResponsiveSpacing(30),
                  },
                ]}
              >
                <Ionicons name="log-in-outline" size={featureIconSize} color="#FFFFFF" />
                <Text style={[styles.buttonText, { fontSize: buttonTextSize }]}>Sign In</Text>
                <View style={styles.buttonShine} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  width: buttonMaxWidth,
                },
              ]}
              onPress={() => handleButtonPress("UserRegister")}
              activeOpacity={0.8}
            >
              <BlurView
                intensity={30}
                style={[
                  styles.buttonBlur,
                  {
                    paddingVertical: getResponsiveSpacing(18),
                    paddingHorizontal: getResponsiveSpacing(30),
                  },
                ]}
              >
                <Ionicons name="person-add-outline" size={featureIconSize} color="#FFFFFF" />
                <Text style={[styles.buttonTextSecondary, { fontSize: buttonTextSize }]}>Sign Up</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>

          {/* Enhanced Features */}
          <Animated.View
            style={[
              styles.featureContainer,
              {
                opacity: fadeAnim,
                marginBottom: getResponsiveSpacing(isLandscape ? 20 : 60),
                paddingHorizontal: getResponsiveSpacing(isTablet ? 20 : 10),
                flexDirection: featureContainerLayout,
                justifyContent: isTablet ? "center" : "space-around",
              },
            ]}
          >
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.featureItem,
                  selectedFeature === index && styles.featureItemSelected,
                  {
                    flex: isTablet ? 0 : 1,
                    marginHorizontal: getResponsiveSpacing(isTablet ? 15 : 8),
                    maxWidth: isTablet ? featureCardSize : undefined,
                  },
                ]}
                onPress={() => handleFeaturePress(index)}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.featureContent,
                    {
                      transform: [
                        {
                          scale: selectedFeature === index ? 1.1 : pulseAnim,
                        },
                      ],
                    },
                  ]}
                >
                  <BlurView
                    intensity={40}
                    style={[
                      styles.featureBlur,
                      {
                        paddingVertical: getResponsiveSpacing(20),
                        paddingHorizontal: getResponsiveSpacing(15),
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[feature.color + "40", feature.color + "20"]}
                      style={[
                        styles.featureIconContainer,
                        {
                          width: getResponsiveSpacing(60),
                          height: getResponsiveSpacing(60),
                          borderRadius: getResponsiveSpacing(30),
                          marginBottom: getResponsiveSpacing(12),
                        },
                      ]}
                    >
                      <Ionicons name={feature.icon} size={featureIconSize} color={feature.color} />
                    </LinearGradient>
                    <Text
                      style={[
                        styles.featureText,
                        {
                          fontSize: featureTextSize,
                          color: feature.color,
                        },
                      ]}
                    >
                      {feature.text}
                    </Text>
                  </BlurView>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Spacer for landscape mode */}
          {isLandscape && !isTablet && <View style={{ height: getResponsiveSpacing(40) }} />}
        </ContentWrapper>

        {/* Enhanced Footer - Fixed positioning */}
        <View
          style={[
            styles.footerContainer,
            {
              marginTop: getResponsiveSpacing(30),
              marginBottom: getResponsiveSpacing(20),
              paddingHorizontal: containerPadding,
            },
          ]}
        >
          
        </View>
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
  content: {
    flex: 1,
  },

  // Decorative elements
  decorativeShape: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },

  // Logo section
  logoContainer: {
    alignItems: "center",
  },
  logoWrapper: {
    marginBottom: 15,
  },
  logoGradient: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoUnderline: {
    backgroundColor: "#4ECDC4",
    borderRadius: 2,
    marginTop: 8,
  },

  // Greeting section
  greetingContainer: {
    alignItems: "center",
  },
  welcomeText: {
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  welcomeTextSecondary: {
    fontWeight: "900",
    color: "#4ECDC4",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    marginTop: -5,
  },
  descriptionWrapper: {
    alignItems: "center",
  },
  descriptionText: {
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    fontWeight: "400",
  },

  // Subtitle section
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtitleLine: {
    flex: 1,
    height: 1,
  },
  subtitleBlur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  subtitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },

  // Button section
  buttonContainer: {
    alignItems: "center",
  },
  primaryButton: {
    borderRadius: 30,
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
    position: "relative",
    overflow: "hidden",
  },
  buttonShine: {
    position: "absolute",
    top: 0,
    left: -100,
    width: 100,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    transform: [{ skewX: "-20deg" }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 12,
    letterSpacing: 1,
  },
  secondaryButton: {
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextSecondary: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 12,
    letterSpacing: 1,
  },

  // Features section
  featureContainer: {
    alignItems: "center",
  },
  featureItem: {
    alignItems: "center",
  },
  featureItemSelected: {
    transform: [{ scale: 1.05 }],
  },
  featureContent: {
    borderRadius: 20,
    overflow: "hidden",
    width: "100%",
  },
  featureBlur: {
    alignItems: "center",
  },
  featureIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // Footer section - Fixed styles
  footerContainer: {
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
  },
  footerBlur: {
    alignItems: "center",
  },
  footerText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  versionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  versionText: {
    color: "#FFFFFF",
    opacity: 0.8,
  },
})

export default EnhancedWelcomeScreen
