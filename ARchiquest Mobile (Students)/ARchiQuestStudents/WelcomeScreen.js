import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  StatusBar, 
  SafeAreaView,
  Animated,
  Platform,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const WelcomeScreen = ({ navigation }) => {
  // Get dimensions dynamically to respond to orientation changes
  const { width, height, fontScale } = useWindowDimensions();
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const buttonAnim = new Animated.Value(0);
  const logoAnim = new Animated.Value(0);

  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate responsive sizes based on screen dimensions and font scale
  const getResponsiveSize = (size) => {
    return size / fontScale;
  };

  // Calculate responsive dimensions
  const logoTextSize = getResponsiveSize(Math.min(28, width * 0.07));
  const welcomeTextSize = getResponsiveSize(Math.min(width * 0.13, 52));
  const descriptionTextSize = getResponsiveSize(Math.min(16, width * 0.04));
  const subtitleSize = getResponsiveSize(Math.min(16, width * 0.04));
  const buttonTextSize = getResponsiveSize(Math.min(18, width * 0.045));
  const featureTextSize = getResponsiveSize(Math.min(12, width * 0.03));
  const footerTextSize = getResponsiveSize(Math.min(16, width * 0.04));
  const versionTextSize = getResponsiveSize(Math.min(12, width * 0.03));
  
  // Calculate responsive paddings and margins
  const horizontalPadding = width < 350 ? 12 : 20;
  const buttonPadding = height < 600 ? 12 : 15;
  const featureItemWidth = Math.min(width * 0.25, 100);
  const featureItemPadding = width < 350 ? 8 : 12;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <LinearGradient
        colors={['#EEF5FF', '#B4D4FF']}
        style={[styles.gradient, { padding: horizontalPadding }]}
      >
        <Animated.View style={[
          styles.logoContainer,
          { 
            opacity: logoAnim, 
            transform: [{ scale: logoAnim }],
            marginTop: height * 0.03,
            marginBottom: height * 0.02
          }
        ]}>
          {/* <Image
            source={require('../assets/logo.png')} // Replace with your app logo
            style={{ width: width * 0.25, height: width * 0.25 }}
            resizeMode="contain"
          /> */}
          <Text style={[styles.logoText, { fontSize: logoTextSize }]}>ARchiQuest</Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.greetingContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginBottom: height * 0.04,
              marginTop: height * 0.02
            }
          ]}
        >
          <Text style={[styles.welcomeText, { fontSize: welcomeTextSize }]}>Explore</Text>
          <Text style={[styles.welcomeText, { fontSize: welcomeTextSize }]}>Architecture</Text>
          <Text style={[styles.descriptionText, { fontSize: descriptionTextSize }]}>
            Discover architectural structures, building materials, and construction principles through interactive AR experiences
          </Text>
        </Animated.View>

        <View style={[styles.subtitleContainer, { marginBottom: height * 0.03 }]}>
          <View style={styles.line} />
          <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>Begin Your Journey</Text>
          <View style={styles.line} />
        </View>

        <Animated.View style={{ opacity: buttonAnim }}>
          <TouchableOpacity 
            style={[
              styles.button, 
              { 
                paddingVertical: buttonPadding,
                width: width > 500 ? '70%' : '85%'
              }
            ]} 
            onPress={() => navigation.navigate('UserLogin')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={[styles.buttonText, { fontSize: buttonTextSize }]}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.buttonOutline, 
              { 
                paddingVertical: buttonPadding,
                width: width > 500 ? '70%' : '85%'
              }
            ]} 
            onPress={() => navigation.navigate('UserRegister')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={20} color="#176B87" style={styles.buttonIcon} />
            <Text style={[styles.buttonOutlineText, { fontSize: buttonTextSize }]}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={[
          styles.featureContainer, 
          { 
            marginTop: height * 0.03,
            width: width > 500 ? '80%' : '95%'
          }
        ]}>
          <View style={[
            styles.featureItem, 
            { 
              width: featureItemWidth,
              padding: featureItemPadding
            }
          ]}>
            <Ionicons 
              name="cube-outline" 
              size={width < 350 ? 20 : 24} 
              color="#176B87" 
            />
            <Text style={[styles.featureText, { fontSize: featureTextSize }]}>3D Models</Text>
          </View>
          <View style={[
            styles.featureItem, 
            { 
              width: featureItemWidth,
              padding: featureItemPadding
            }
          ]}>
            <Ionicons 
              name="school-outline" 
              size={width < 350 ? 20 : 24} 
              color="#176B87" 
            />
            <Text style={[styles.featureText, { fontSize: featureTextSize }]}>Learn</Text>
          </View>
          <View style={[
            styles.featureItem, 
            { 
              width: featureItemWidth,
              padding: featureItemPadding
            }
          ]}>
            <Ionicons 
              name="glasses-outline" 
              size={width < 350 ? 20 : 24} 
              color="#176B87" 
            />
            <Text style={[styles.featureText, { fontSize: featureTextSize }]}>AR View</Text>
          </View>
        </View>

        <View style={[
          styles.footer, 
          { 
            bottom: Platform.OS === 'ios' ? 20 : 10,
            paddingBottom: Platform.OS === 'android' ? 10 : 0
          }
        ]}>
          <Text style={[styles.footerText, { fontSize: footerTextSize }]}>
            Interactive Architectural Learning
          </Text>
          <Text style={[styles.versionText, { fontSize: versionTextSize }]}>
            Version 1.0
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontWeight: 'bold',
    color: '#176B87',
    marginTop: 10,
    letterSpacing: 1,
  },
  greetingContainer: {
    marginLeft: '5%',
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#176B87',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  descriptionText: {
    color: '#555',
    marginTop: 15,
    lineHeight: 24,
    maxWidth: '90%',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '90%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#176B87',
    opacity: 0.3,
  },
  subtitle: {
    color: '#176B87',
    paddingHorizontal: 15,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#176B87',
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonOutline: {
    borderColor: '#176B87',
    borderWidth: 1.5,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonOutlineText: {
    color: '#176B87',
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'center',
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureText: {
    color: '#176B87',
    marginTop: 5,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: '#176B87',
    fontWeight: '600',
  },
  versionText: {
    color: '#666',
    marginTop: 5,
  }
});

export default WelcomeScreen;