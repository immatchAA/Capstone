import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';

const { width, height } = Dimensions.get('window');

const DesignPlanViewer = ({ route, navigation }) => {
  const { classId, classKey } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [classDetails, setClassDetails] = useState(null);
  const [error, setError] = useState(null);
  const [designPlans, setDesignPlans] = useState([]);
  const [instructorId, setInstructorId] = useState(null);

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  // Fetch instructor's design plans after we have the instructor ID
  useEffect(() => {
    if (instructorId) {
      fetchInstructorDesignPlans();
    }
  }, [instructorId]);

  const fetchClassDetails = async () => {
    try {
      if (!classId) {
        setError("Class ID is missing");
        setIsLoading(false);
        return;
      }

      // Get available columns first to avoid errors with missing columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('classes')
        .select('*')
        .limit(1);

      if (columnsError) {
        console.error("Error checking classes columns:", columnsError);
        setError(`Failed to check table structure: ${columnsError.message}`);
        setIsLoading(false);
        return;
      }

      // Build a dynamic query based on available columns
      let query = ['id', 'class_key'];
      
      // Add optional columns if they exist
      if (columnsData && columnsData.length > 0) {
        const availableColumns = Object.keys(columnsData[0]);
        if (availableColumns.includes('class_name')) query.push('class_name');
        if (availableColumns.includes('description')) query.push('description');
        if (availableColumns.includes('teacher_id')) {
          query.push('teacher_id');
          query.push('teachers:teacher_id (first_name, last_name)');
        }
        if (availableColumns.includes('created_at')) query.push('created_at');
      }

      // Execute the query with only available columns
      const { data, error } = await supabase
        .from('classes')
        .select(query.join(','))
        .eq('id', classId)
        .single();

      if (error) {
        console.error("Error fetching class details:", error);
        setError(`Failed to load class: ${error.message}`);
      } else if (data) {
        setClassDetails(data);
        
        // Store the instructor ID for fetching their design plans
        if (data.teacher_id) {
          setInstructorId(data.teacher_id);
        } else {
          console.log("No teacher_id found for this class");
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error("Exception in fetchClassDetails:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const fetchInstructorDesignPlans = async () => {
    try {
      console.log(`Fetching design plans created by instructor: ${instructorId}`);
      
      // Try different possible column names for the instructor/creator ID
      const possibleCreatorColumns = [
        'teacher_id', 
        'instructor_id', 
        'created_by', 
        'author_id', 
        'user_id'
      ];
      
      let designData = [];
      let foundColumn = false;
      
      for (const column of possibleCreatorColumns) {
        try {
          const { data, error } = await supabase
            .from('design_plan')
            .select('*')
            .eq(column, instructorId);
            
          if (!error && data && data.length > 0) {
            console.log(`Found ${data.length} design plans using column: ${column}`);
            designData = data;
            foundColumn = true;
            break;
          }
        } catch (columnErr) {
          // This column might not exist, try the next one
          console.log(`Column ${column} might not exist:`, columnErr.message);
        }
      }
      
      // If we couldn't find by instructor ID columns, try class ID + is_instructor flag
      if (!foundColumn) {
        try {
          const { data, error } = await supabase
            .from('design_plan')
            .select('*')
            .eq('class_id', classId)
            .eq('is_instructor_plan', true);
            
          if (!error && data && data.length > 0) {
            console.log(`Found ${data.length} instructor design plans using is_instructor_plan flag`);
            designData = data;
          }
        } catch (flagErr) {
          console.log("is_instructor_plan column might not exist");
        }
      }
      
      // If we still don't have any plans, try one last approach - get all plans for this class
      // and we'll just show them all (not ideal but better than nothing)
      if (designData.length === 0) {
        const possibleClassColumns = ['class_id', 'classId', 'class', 'class_key'];
        
        for (const column of possibleClassColumns) {
          try {
            const { data, error } = await supabase
              .from('design_plan')
              .select('*')
              .eq(column, column === 'class_key' ? classKey : classId);
              
            if (!error && data && data.length > 0) {
              console.log(`Found ${data.length} design plans for class using column: ${column}`);
              designData = data;
              break;
            }
          } catch (columnErr) {
            // This column might not exist, try the next one
            console.log(`Column ${column} might not exist:`, columnErr.message);
          }
        }
      }
      
      setDesignPlans(designData);
    } catch (err) {
      console.error("Error fetching instructor design plans:", err);
      setError("Failed to load instructor design plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

    const handleStartDesign = (designPlan) => {
    // Navigate to the design plan details screen
    navigation.navigate('DesignPlanDetails', {
        designPlan: designPlan,
        classId: classId,
        classKey: classKey
    });
    };

  const handleViewProgress = () => {
    // Navigate to progress screen
    navigation.navigate('DesignProgressScreen', {
      classId: classId,
      classKey: classKey,
      className: classDetails?.class_name || `Class #${classId}`
    });
  };

  const handleCreateSample = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert("Error", "You must be logged in to create a design");
        return;
      }
      
      // Create a sample design plan
      const samplePlan = {
        title: "Sample Instructor Design Plan",
        description: "This is a sample design plan created by the instructor for this class.",
        user_id: user.id,  // Current user (not the instructor)
        class_id: classId,
        created_at: new Date().toISOString(),
        status: "in_progress",
        is_instructor_plan: true  // Flag it as an instructor plan
      };
      
      // Try to add teacher_id if we have it
      if (instructorId) {
        samplePlan.teacher_id = instructorId;
      }
      
      const { data, error } = await supabase
        .from('design_plan')
        .insert([samplePlan])
        .select();
        
      if (error) {
        console.error("Error creating sample plan:", error);
        Alert.alert("Error", `Failed to create sample: ${error.message}`);
      } else {
        Alert.alert("Success", "Sample instructor design plan created!");
        fetchInstructorDesignPlans();
      }
    } catch (err) {
      console.error("Exception in createSample:", err);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#176BB7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instructor Design Plans</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Background Card */}
        <View style={styles.card}>
          {/* Class Image/Banner */}
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2429&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
            style={styles.classBanner}
            imageStyle={styles.classBannerImage}
          >
            <View style={styles.bannerOverlay}>
              <Text style={styles.className}>
                {classDetails?.class_name || `Class #${classId}`}
              </Text>
              <Text style={styles.classKey}>
                Class Key: {classKey}
              </Text>
            </View>
          </ImageBackground>

          {/* Class Info */}
          <View style={styles.classInfo}>
            {classDetails?.teachers && (
              <View style={styles.instructorContainer}>
                <Ionicons name="school-outline" size={20} color="#176BB7" />
                <Text style={styles.teacherName}>
                  Instructor: {classDetails.teachers.first_name} {classDetails.teachers.last_name}
                </Text>
              </View>
            )}
            
            {classDetails?.description ? (
              <Text style={styles.classDescription}>
                {classDetails.description}
              </Text>
            ) : (
              <Text style={styles.classDescription}>
                No description available for this class. This class includes design plans created by the instructor that students can work on to enhance their understanding of architectural and construction concepts.
              </Text>
            )}
          </View>

          {/* Design Plan Details */}
          <View style={styles.designPlanContainer}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="document-text" size={22} color="#176BB7" />
              <Text style={styles.sectionTitle}>Instructor Design Plans</Text>
            </View>
            
            {designPlans.length > 0 ? (
              designPlans.map((plan, index) => (
                <View key={plan.id || index} style={styles.planItem}>
                  <View style={styles.planIconContainer}>
                    <Ionicons name="document-text-outline" size={28} color="#176BB7" />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planTitle}>
                      {plan.title || plan.plan_name || `Design Plan ${index + 1}`}
                    </Text>
                    <Text style={styles.planDescription} numberOfLines={2}>
                      {plan.description || "No description available"}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.planButton}
                    onPress={() => handleStartDesign(plan)}
                  >
                    <Text style={styles.planButtonText}>Open</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#B4D4FF" />
                <Text style={styles.emptyStateText}>
                  No instructor design plans found for this class
                </Text>
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={handleCreateSample}
                >
                  <Text style={styles.createButtonText}>Create Sample Plan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => {
                if (designPlans.length > 0) {
                  handleStartDesign(designPlans[0]);
                } else {
                  handleCreateSample();
                }
              }}
            >
              <Text style={styles.primaryButtonText}>
                {designPlans.length > 0 ? "Start Design Plan" : "Create Sample Plan"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleViewProgress}
            >
              <Text style={styles.secondaryButtonText}>View Class Progress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF5FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF5FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#176BB7',
    height: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classBanner: {
    height: 180,
    justifyContent: 'flex-end',
  },
  classBannerImage: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
  },
  className: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  classKey: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  classInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF5FF',
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  classDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  designPlanContainer: {
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#176BB7',
    marginLeft: 8,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  planIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
  },
  planButton: {
    backgroundColor: '#B4D4FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  planButtonText: {
    color: '#1E4F91',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFF',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#B4D4FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#1E4F91',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonContainer: {
    padding: 16,
    paddingTop: 8,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#176BB7',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#EEF5FF',
  },
  secondaryButtonText: {
    color: '#176BB7',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DesignPlanViewer;