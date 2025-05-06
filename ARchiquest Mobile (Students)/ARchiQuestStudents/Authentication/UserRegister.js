import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';

const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  rightIcon,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useState(new Animated.Value(value ? 1 : 0))[0];

useEffect(() => {
  if (!isFocused && !value) {
    Animated.timing(labelAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  } else {
    Animated.timing(labelAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }
}, [isFocused, value]);

const labelStyle = {
  position: 'absolute',
  left: 12,
  top: labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -8],
  }),
  fontSize: labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  }),
  color: '#000',
  backgroundColor: '#fff',
  paddingHorizontal: 4,
};

  return (
    <View style={styles.inputContainer}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.inputField, inputStyle]}
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

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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
    }
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
  
    setErrors(newErrors);
  
    if (isValid) {
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
        alert('❌ Sign up failed: ' + error.message);
        return;
      }

      const userId = data.user?.id;

    if (userId) {
      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: 'Student',
        created_at: new Date()
      });

      if (insertError) {
        alert('❌ Failed to save profile: ' + insertError.message);
      } else {
        alert('✅ Registration successful! Please check your email to confirm.');
        navigation.navigate('UserLogin');
      }
    }
  }
};
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SIGN UP</Text>
      <Text style={styles.subtitle}>Join ARchiquest as a Valued Member</Text>

      <FloatingLabelInput
  label="First Name"
  value={firstName}
  onChangeText={setFirstName}
/>
{errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

<FloatingLabelInput
  label="Last Name"
  value={lastName}
  onChangeText={setLastName}
/>
{errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

<FloatingLabelInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>
{errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

<FloatingLabelInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={!showPassword}
  rightIcon={
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={15} color="#176B87" />
    </TouchableOpacity>
  }
/>
{errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

<FloatingLabelInput
  label="Confirm Password"
  value={confirmPassword}
  onChangeText={setConfirmPassword}
  secureTextEntry={!showConfirmPassword}
  rightIcon={
    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
      <FontAwesome5 name={showConfirmPassword ? 'eye-slash' : 'eye'} size={15} color="#176B87" />
    </TouchableOpacity>
  }
/>
{errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}


    <TouchableOpacity style={styles.registerButton} onPress={handleSignUp}>
      <Text style={styles.registerButtonText}>Sign Up</Text>
    </TouchableOpacity>

    <View style={styles.signInContainer}>
      <Text>Already have an account?</Text>
      <TouchableOpacity onPress={() => navigation.navigate('UserLogin')}>
        <Text style={styles.signInLink}> Click Here</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#176B87',
  },
  subtitle: {
    fontSize: 14,
    color: '#7a7a7a',
    marginBottom: 20,
  },
  roleSwitch: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 5,
    marginBottom: 20,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  activeRole: {
    backgroundColor: '#176B87',
  },
  roleText: {
    marginLeft: 5,
    color: '#333',
  },
  activeRoleText: {
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#176B87',
    paddingVertical: 12,
    width: '90%',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  signInLink: {
    color: '#007bff',
  },
  inputContainer: {
    width: '90%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#176B87',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 8,
    position: 'relative',
    backgroundColor: '#fff',
  },
  inputField: {
    fontSize: 16,
    color: '#000',
    padding: 0,
    paddingRight: 30,
  },
  rightIcon: {
    position: 'absolute',
    right: 10,
    top: 15,
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

export default UserRegister;
