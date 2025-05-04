import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { getAuth, createUserWithEmailAndPassword, updateProfile, browserLocalPersistence } from 'firebase/auth';
import {auth, db} from "../firebaseConfig";
import {collection, addDoc } from 'firebase/firestore';

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
    firstName: ' ',
    lastName: ' ',
    email: ' ',
    password: ' ',
    confirmPassword: ' ',
  };

  if (!firstName) {
    newErrors .firstName = "First Name is required";
    isValid = false;
  }
   if (!lastName) {
    newErrors.lastName = "Last Name is Required";
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
   if (password != confirmPassword) {
    newErrors.confirmPassword = "Password do not match";
    isValid = false;
   }

   setErrors(newErrors)


   if (isValid) {
    try {
      const authInstance = getAuth();
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      const user = userCredential.user;
  
      await updateProfile(user, {
        displayName: `${firstName} ${lastName} (Student)`,
      });
  
      await addDoc(collection(db, 'students'), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        role: 'Student',
        createdAt: new Date(),
      });
  
      alert('Registration Successful');
      navigation.navigate('UserLogin');
    } catch (error) {
      alert(error.message);
    }
  }
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SIGN UP</Text>
      <Text style={styles.subtitle}>Join ARchiquest as a Valued Member</Text>

      <View style={styles.roleSwitch}>
    
      </View>

      {/* Input Fields */}
      <Text style={styles.label}></Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

      <Text style={styles.label}></Text>
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

      <Text style={styles.label}></Text>
      <TextInput
        style={styles.input}
        placeholder="email@example.com"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.label}></Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="PASWORD"
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
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <Text style={styles.label}></Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="CONFIRM PASSWORD"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <FontAwesome5
            name={showConfirmPassword ? 'eye-slash' : 'eye'}
            size={15}
            color="#176B87"
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      <TouchableOpacity style={styles.registerButton} onPress={handleSignUp}>
        <Text style={styles.registerButtonText}>SIGN UP</Text>
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
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#7a7a7a',
    marginBottom: 15,
  },
  roleSwitch: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#B4D4FF',
  },
  activeRole: {
    backgroundColor: '#86B6F6',
    borderColor: '#176B87',
  },
  roleText: {
    fontSize: 14,
    color: '#333',
  },
  activeRoleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    width: '90%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#176B87',
    backgroundColor: '#B4D4FF',
    marginBottom: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#176B87',
    backgroundColor: '#B4D4FF',
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  registerButton: {
    backgroundColor: '#B4D4FF',
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
  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
});

export default UserRegister;
