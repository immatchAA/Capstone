import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabaseClient';

const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  rightIcon,
  error,
  autoCapitalize = 'none',
  icon,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const { fontScale } = useWindowDimensions();

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute',
    left: icon ? 40 : 16,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [17, -9],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16 / fontScale, 12 / fontScale],
    }),
    color: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#176B87', '#176B87'],
    }),
    backgroundColor: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#fff', 'transparent'],
    }),
  };

  return (
    <View style={[styles.inputContainer, error ? styles.inputError : null]}>
      {icon && <View style={styles.inputIcon}>{icon}</View>}
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.inputField, icon ? styles.inputWithIcon : null]}
        autoCapitalize={autoCapitalize}
      />
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
};

const UserRegister = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { width, height, fontScale } = useWindowDimensions();

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Include at least 1 uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Include at least 1 lowercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("Include at least 1 number");
    }
    if (!/[@$!%*?&#]/.test(password)) {
      errors.push("Include at least 1 special character");
    }
    return errors;
  };

  const handleSignUp = async () => {
    let isValid = true;
  
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
  
    if (!firstName) {
      newErrors.firstName = "First Name is required";
      isValid = false;
    }
    
    if (!lastName) {
      newErrors.lastName = "Last Name is required";
      isValid = false;
    }
    
    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors[0]; // Show first error for cleaner UI
        isValid = false;
      }
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
  
    setErrors(newErrors);
  
    if (isValid) {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: 'student'
            }
          }
        });
      
        if (error) {
          alert('Registration failed: ' + error.message);
          setIsLoading(false);
          return;
        }

        const userId = data.user?.id;

        if (userId) {
          const { error: insertError } = await supabase.from('users').insert({
            id: userId,
            first_name: firstName,
            last_name: lastName,
            email: email,
            role: 'student',
            created_at: new Date()
          });

          if (insertError) {
            alert('Failed to save profile: ' + insertError.message);
          } else {
            alert('Registration successful! Please check your email to verify your account.');
            navigation.navigate('UserLogin');
          }
        }
      } catch (error) {
        alert('An unexpected error occurred. Please try again.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Calculate responsive sizes
  const getResponsiveSize = (size) => {
    return size / fontScale;
  };

  const responsiveStyles = {
    title: {
      fontSize: getResponsiveSize(28),
    },
    subtitle: {
      fontSize: getResponsiveSize(16),
    },
    inputField: {
      fontSize: getResponsiveSize(16),
    },
    errorText: {
      fontSize: getResponsiveSize(14),
    },
    passwordRequirement: {
      fontSize: getResponsiveSize(13),
    },
    registerButtonText: {
      fontSize: getResponsiveSize(18),
    },
    signInText: {
      fontSize: getResponsiveSize(16),
    },
    signInButtonText: {
      fontSize: getResponsiveSize(16),
    },
    footerText: {
      fontSize: getResponsiveSize(12),
    },
  };

  // Calculate padding based on screen size
  const horizontalPadding = width < 350 ? 12 : 20;
  const verticalPadding = height < 600 ? 15 : 20;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF5FF" />
      
      <LinearGradient
        colors={['#EEF5FF', '#B4D4FF']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView 
            contentContainerStyle={[
              styles.scrollContainer,
              { 
                paddingHorizontal: horizontalPadding,
                paddingTop: Platform.OS === 'android' ? 40 : verticalPadding 
              }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity 
              style={[styles.backButton, { top: Platform.OS === 'android' ? 40 : verticalPadding }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#176B87" />
            </TouchableOpacity>
            
            <View style={[styles.headerContainer, { marginTop: height * 0.06 }]}>
              {/* <Image
                source={require('../assets/logo.png')}
                style={[styles.logo, { width: width * 0.18, height: width * 0.18 }]}
                resizeMode="contain"
              /> */}
              <Text style={[styles.title, responsiveStyles.title]}>Create Account</Text>
              <Text style={[styles.subtitle, responsiveStyles.subtitle]}>Join ARchiQuest to explore architecture</Text>
            </View>
            
            <View style={styles.formContainer}>
              <FloatingLabelInput
                label="First Name"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (errors.firstName) setErrors({...errors, firstName: ''});
                }}
                error={errors.firstName}
                autoCapitalize="words"
                icon={<Ionicons name="person-outline" size={20} color="#176B87" />}
              />
              {errors.firstName ? <Text style={[styles.errorText, responsiveStyles.errorText]}>{errors.firstName}</Text> : null}

              <FloatingLabelInput
                label="Last Name"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (errors.lastName) setErrors({...errors, lastName: ''});
                }}
                error={errors.lastName}
                autoCapitalize="words"
                icon={<Ionicons name="person-outline" size={20} color="#176B87" />}
              />
              {errors.lastName ? <Text style={[styles.errorText, responsiveStyles.errorText]}>{errors.lastName}</Text> : null}

              <FloatingLabelInput
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({...errors, email: ''});
                }}
                keyboardType="email-address"
                error={errors.email}
                icon={<Ionicons name="mail-outline" size={20} color="#176B87" />}
              />
              {errors.email ? <Text style={[styles.errorText, responsiveStyles.errorText]}>{errors.email}</Text> : null}

              <FloatingLabelInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({...errors, password: ''});
                }}
                secureTextEntry={!showPassword}
                error={errors.password}
                icon={<Ionicons name="lock-closed-outline" size={20} color="#176B87" />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#176B87" 
                    />
                  </TouchableOpacity>
                }
              />
              {errors.password ? <Text style={[styles.errorText, responsiveStyles.errorText]}>{errors.password}</Text> : null}

              <FloatingLabelInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                }}
                secureTextEntry={!showConfirmPassword}
                error={errors.confirmPassword}
                icon={<Ionicons name="lock-closed-outline" size={20} color="#176B87" />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#176B87" 
                    />
                  </TouchableOpacity>
                }
              />
              {errors.confirmPassword ? <Text style={[styles.errorText, responsiveStyles.errorText]}>{errors.confirmPassword}</Text> : null}

              {password && !errors.password && (
                <View style={styles.passwordStrengthContainer}>
                  <Text style={[styles.passwordStrengthText, { fontSize: getResponsiveSize(14) }]}>Password requirements:</Text>
                  <View style={styles.passwordRequirements}>
                    <Text style={[
                      styles.passwordRequirement, 
                      responsiveStyles.passwordRequirement,
                      password.length >= 8 ? styles.passwordRequirementMet : null
                    ]}>
                      <Ionicons 
                        name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                        size={14} 
                        color={password.length >= 8 ? "#4CAF50" : "#666"} 
                      /> At least 8 characters
                    </Text>
                    <Text style={[
                      styles.passwordRequirement, 
                      responsiveStyles.passwordRequirement,
                      /[A-Z]/.test(password) ? styles.passwordRequirementMet : null
                    ]}>
                      <Ionicons 
                        name={/[A-Z]/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                        size={14} 
                        color={/[A-Z]/.test(password) ? "#4CAF50" : "#666"} 
                      /> One uppercase letter
                    </Text>
                    <Text style={[
                      styles.passwordRequirement, 
                      responsiveStyles.passwordRequirement,
                      /[a-z]/.test(password) ? styles.passwordRequirementMet : null
                    ]}>
                      <Ionicons 
                        name={/[a-z]/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                        size={14} 
                        color={/[a-z]/.test(password) ? "#4CAF50" : "#666"} 
                      /> One lowercase letter
                    </Text>
                    <Text style={[
                      styles.passwordRequirement, 
                      responsiveStyles.passwordRequirement,
                      /\d/.test(password) ? styles.passwordRequirementMet : null
                    ]}>
                      <Ionicons 
                        name={/\d/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                        size={14} 
                        color={/\d/.test(password) ? "#4CAF50" : "#666"} 
                      /> One number
                    </Text>
                    <Text style={[
                      styles.passwordRequirement, 
                      responsiveStyles.passwordRequirement,
                      /[@$!%*?&#]/.test(password) ? styles.passwordRequirementMet : null
                    ]}>
                      <Ionicons 
                        name={/[@$!%*?&#]/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                        size={14} 
                        color={/[@$!%*?&#]/.test(password) ? "#4CAF50" : "#666"} 
                      /> One special character
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity 
                style={[
                  styles.registerButton,
                  { paddingVertical: height < 600 ? 12 : 15 }
                ]} 
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={[styles.registerButtonText, responsiveStyles.registerButtonText]}>Create Account</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={[styles.dividerContainer, { marginVertical: height < 600 ? 15 : 25 }]}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.signInContainer}>
                <Text style={[styles.signInText, responsiveStyles.signInText]}>Already have an account?</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('UserLogin')}
                  style={[
                    styles.signInButton,
                    { paddingVertical: height < 600 ? 10 : 12 }
                  ]}
                >
                  <Text style={[styles.signInButtonText, responsiveStyles.signInButtonText]}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.footer, { marginTop: height < 600 ? 20 : 30 }]}>
              <Text style={[styles.footerText, responsiveStyles.footerText]}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    marginBottom: 10,
  },
  title: { 
    fontWeight: 'bold', 
    color: '#176B87',
    marginBottom: 8,
  },
  subtitle: { 
    color: '#555', 
    textAlign: 'center',
    maxWidth: '80%',
  },
  formContainer: {
    width: '100%',
    marginTop: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B4D4FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 10,
    position: 'relative',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1.5,
  },
  inputField: {
    color: '#333',
    padding: 0,
    paddingRight: 30,
  },
  inputWithIcon: {
    paddingLeft: 30,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 20,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    top: 20,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: -15,
    marginBottom: 15,
    marginLeft: 5,
  },
  passwordStrengthContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  passwordStrengthText: {
    fontWeight: '500',
    color: '#176B87',
    marginBottom: 8,
  },
  passwordRequirements: {
    marginLeft: 5,
  },
  passwordRequirement: {
    color: '#666',
    marginBottom: 4,
  },
  passwordRequirementMet: {
    color: '#4CAF50',
  },
  registerButton: { 
    backgroundColor: '#176B87', 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginTop: 10,
  },
  registerButtonText: { 
    color: '#fff', 
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#B4D4FF',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#666',
    fontWeight: '500',
  },
  signInContainer: { 
    alignItems: 'center',
  },
  signInText: {
    color: '#555',
    marginBottom: 12,
  },
  signInButton: {
    borderWidth: 1.5,
    borderColor: '#176B87',
    borderRadius: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  signInButtonText: {
    color: '#176B87',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    textAlign: 'center',
  },
});

export default UserRegister;