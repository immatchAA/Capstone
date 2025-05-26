import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  StatusBar, 
  Dimensions, 
  SafeAreaView,
  Animated,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <LinearGradient
        colors={['#EEF5FF', '#B4D4FF']}
        style={styles.gradient}
      >
        <Animated.View style={[
          styles.logoContainer,
          { opacity: logoAnim, transform: [{ scale: logoAnim }] }
        ]}>
          {/* <Image
            source={require('../assets/logo.png')} // Replace with your app logo
            style={styles.logo}
            resizeMode="contain"
          /> */}
          <Text style={styles.logoText}>ARchiQuest</Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.greetingContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.welcomeText}>Explore</Text>
          <Text style={styles.welcomeText}>Architecture</Text>
          <Text style={styles.descriptionText}>
            Discover architectural structures, building materials, and construction principles through interactive AR experiences
          </Text>
        </Animated.View>

        <View style={styles.subtitleContainer}>
          <View style={styles.line} />
          <Text style={styles.subtitle}>Begin Your Journey</Text>
          <View style={styles.line} />
        </View>

        <Animated.View style={{ opacity: buttonAnim }}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('UserLogin')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonOutline} 
            onPress={() => navigation.navigate('UserRegister')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={20} color="#176B87" style={styles.buttonIcon} />
            <Text style={styles.buttonOutlineText}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.featureContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="cube-outline" size={24} color="#176B87" />
            <Text style={styles.featureText}>3D Models</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="school-outline" size={24} color="#176B87" />
            <Text style={styles.featureText}>Learn</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="glasses-outline" size={24} color="#176B87" />
            <Text style={styles.featureText}>AR View</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Interactive Architectural Learning</Text>
          <Text style={styles.versionText}>Version 1.0</Text>
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
    padding: '2.5%',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.03,
    marginBottom: height * 0.02,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#176B87',
    marginTop: 10,
    letterSpacing: 1,
  },
  greetingContainer: {
    marginBottom: height * 0.05,
    marginLeft: '5%',
    marginTop: height * 0.02,
  },
  welcomeText: {
    fontSize: width * 0.13,
    fontWeight: 'bold',
    color: '#176B87',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    marginTop: 15,
    lineHeight: 24,
    maxWidth: '90%',
    textAlign: 'justify',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.04,
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
    fontSize: 16,
    color: '#176B87',
    paddingHorizontal: 15,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#176B87',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
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
    fontSize: 18,
    fontWeight: '600',
  },
  buttonOutline: {
    borderColor: '#176B87',
    borderWidth: 1.5,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonOutlineText: {
    color: '#176B87',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: height * 0.04,
    width: '90%',
    alignSelf: 'center',
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 12,
    borderRadius: 12,
    width: width * 0.25,
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
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: '#176B87',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  }
});

export default WelcomeScreen;