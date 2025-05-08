import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';

const UserLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setEmail('');
      setPassword('');
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogin = async () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        alert('Login failed: ' + error.message);
      } else {
        alert('Welcome to ARchiQuest');
        navigation.navigate('MainLanding');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Password reset email sent!');
      }
    } else {
      alert('Please enter your email.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ARchiQuest</Text>
      <Text style={styles.subtitle}>Login</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="email@example.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="••••••••"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome5
            name={showPassword ? 'eye-slash' : 'eye'}
            size={15}
            color="#176B87"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text>Don't have an account yet?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('UserRegister')}>
          <Text style={styles.signUpLink}> Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#fff', 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#176B87' 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#7a7a7a', 
    marginBottom: 20 
  },
  label: { 
    alignSelf: 'flex-start', 
    marginLeft: 20, 
    fontSize: 16, 
    marginTop: 10 
  },
  input: { 
    width: '90%', 
    padding: 10, 
    borderWidth: 1, 
    borderRadius: 8, 
    borderColor: '#176B87', 
    backgroundColor: '#fff', 
    marginBottom: 10 
  },
  passwordContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '90%', 
    paddingHorizontal: 2, 
    borderWidth: 1, 
    borderRadius: 8, 
    borderColor: '#176B87', 
    backgroundColor: '#fff', 
    marginBottom: 10 
  },
  passwordInput: { 
    flex: 1, 
    padding: 10 
  },
  eyeIcon: { 
    padding: 10 
  },
  loginButton: { 
    backgroundColor: '#176B87', 
    paddingVertical: 12, 
    width: '90%', 
    alignItems: 'center', 
    borderRadius: 8, 
    marginVertical: 10 
  },
  loginButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  forgotPasswordContainer: { 
    alignSelf: 'flex-end', 
    marginRight: 20, 
    marginTop: -5 
  },
  forgotPasswordText: { 
    color: '#007bff' 
  },
  signUpContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  signUpLink: { 
    color: '#007bff' 
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 5,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
});

export default UserLogin;
