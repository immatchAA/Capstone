import React, { useState, useEffect } from 'react';
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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabaseClient';

const { width, height } = Dimensions.get('window');

const UserLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setEmail('');
      setPassword('');
      setErrors({ email: '', password: '' });
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogin = async () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };
  
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
  
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
  
    setErrors(newErrors);
  
    if (isValid) {
      setIsLoading(true);
      
      try {
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
          navigation.navigate('MainLanding');
        }
      } catch (error) {
        alert('An unexpected error occurred. Please try again.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({
        ...errors,
        email: 'Please enter your email to reset password'
      });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({
        ...errors,
        email: 'Please enter a valid email address'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Password reset email sent! Please check your inbox.');
      }
    } catch (error) {
      alert('An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#176B87" />
            </TouchableOpacity>
            
            <View style={styles.headerContainer}>
              {/* <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              /> */}
              <Text style={styles.title}>ARchiQuest</Text>
              <Text style={styles.subtitle}>Sign in to continue your architectural journey</Text>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                  <Ionicons name="mail-outline" size={20} color="#176B87" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) {
                        setErrors({...errors, email: ''});
                      }
                    }}
                    autoCapitalize="none"
                  />
                </View>
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#176B87" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) {
                        setErrors({...errors, password: ''});
                      }
                    }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#176B87"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              </View>

              <TouchableOpacity 
                onPress={handleForgotPassword} 
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account yet?</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('UserRegister')}
                  style={styles.signUpButton}
                >
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By signing in, you agree to our Terms of Service and Privacy Policy
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
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: height * 0.04,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    marginBottom: 10,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#176B87',
    marginBottom: 8,
  },
  subtitle: { 
    fontSize: 16, 
    color: '#555', 
    textAlign: 'center',
    maxWidth: '80%',
  },
  formContainer: {
    width: '100%',
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: { 
    fontSize: 16, 
    fontWeight: '500',
    color: '#176B87',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#B4D4FF',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: { 
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: { 
    padding: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  forgotPasswordContainer: { 
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: { 
    color: '#176B87',
    fontWeight: '500',
  },
  loginButton: { 
    backgroundColor: '#176B87', 
    paddingVertical: 15, 
    borderRadius: 12, 
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  loginButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
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
  signUpContainer: { 
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  signUpButton: {
    borderWidth: 1.5,
    borderColor: '#176B87',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  signUpButtonText: {
    color: '#176B87',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default UserLogin;