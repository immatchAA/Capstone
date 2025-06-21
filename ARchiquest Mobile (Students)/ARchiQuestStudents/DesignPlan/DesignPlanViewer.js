import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../supabaseClient';

const { width, height } = Dimensions.get('window');

const DesignPlanViewer = ({ route, navigation }) => {
  const { classId, classKey } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [classDetails, setClassDetails] = useState(null);
  const [error, setError] = useState(null);
  const [designPlans, setDesignPlans] = useState([]);
  const [instructorId, setInstructorId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [studentProgress, setStudentProgress] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userId && designPlans.length > 0) {
        console.log('🔄 Screen focused, refreshing student progress...');
        refreshStudentProgress();
      }
    }, [userId, designPlans])
  );

  useEffect(() => {
    fetchUserData();
    fetchClassDetails();
  }, [classId]);

  useEffect(() => {
    if (instructorId && userId) {
      fetchInstructorDesignPlans();
    }
  }, [instructorId, userId]);

  const fetchUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        console.log('👤 Current user ID:', user.id);
        setUserId(user.id);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchClassDetails = async () => {
    try {
      if (!classId) {
        setError("Class ID is missing");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('class_keys')
        .select(`
          id,
          class_key,
          class_name,
          class_description,
          teacher_id,
          teachers:teacher_id (
            first_name,
            last_name
          )
        `)
        .eq('id', classId)
        .single();

      if (error) {
        console.error("Error fetching class details:", error);
        setError(`Failed to load class: ${error.message}`);
      } else if (data) {
        setClassDetails(data);
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

  const fetchStudentProgress = async (designPlanIds) => {
    if (!userId || !designPlanIds.length) {
      console.log('⚠️ Cannot fetch progress: missing userId or designPlanIds');
      return;
    }

    try {
      console.log('📊 Fetching student progress...');
      console.log('📊 User ID:', userId);
      console.log('📊 Design plan IDs:', designPlanIds);

      // Query the student_progress table with the correct structure
      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          id,
          student_id,
          design_plan_id,
          class_id,
          progress_step,
          is_completed,
          final_score,
          final_letter_grade,
          completed_at,
          score,
          completion_data
        `)
        .eq('student_id', userId)
        .in('design_plan_id', designPlanIds);

      if (error) {
        console.error('❌ Error fetching student progress:', error);
        return;
      }

      console.log('✅ Raw student progress data:', data);

      // Convert array to object for easy lookup
      const progressMap = {};
      if (data && data.length > 0) {
        data.forEach(progress => {
          progressMap[progress.design_plan_id] = progress;
          console.log(`📈 Plan ${progress.design_plan_id}:`, {
            completed: progress.is_completed,
            score: progress.final_score || progress.score,
            grade: progress.final_letter_grade
          });
        });
      } else {
        console.log('📊 No progress records found for this user');
      }

      setStudentProgress(progressMap);
    } catch (err) {
      console.error('❌ Exception fetching student progress:', err);
    }
  };

  const refreshStudentProgress = async () => {
    if (!userId || designPlans.length === 0) return;
    
    setRefreshing(true);
    const planIds = designPlans.map(plan => plan.id);
    await fetchStudentProgress(planIds);
    setRefreshing(false);
  };

  const fetchInstructorDesignPlans = async () => {
    try {
      console.log(`🔍 Fetching design plans for instructor: ${instructorId}`);
      
      // Query design_plan table using teacher_id
      const { data, error } = await supabase
        .from('design_plan')
        .select('*')
        .eq('teacher_id', instructorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Error fetching design plans:", error);
        setError("Failed to load instructor design plans");
      } else if (data) {
        console.log(`✅ Found ${data.length} design plans`);
        console.log('🎯 Design plans:', data.map(p => ({ id: p.id, name: p.plan_name })));
        setDesignPlans(data);
        
        // Fetch student progress for these design plans
        if (data.length > 0) {
          const planIds = data.map(plan => plan.id);
          await fetchStudentProgress(planIds);
        }
      }
    } catch (err) {
      console.error("❌ Exception fetching design plans:", err);
      setError("Failed to load instructor design plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleStartDesign = (designPlan) => {
    console.log('🚀 Opening design plan:', designPlan.id);
    navigation.navigate('DesignPlanDetails', {
        designPlan: designPlan,
        classId: classId,
        classKey: classKey
    });
  };

  // Get completion status for a design plan
  const getCompletionStatus = (planId) => {
    const progress = studentProgress[planId];
    console.log(`🔍 Checking completion for plan ${planId}:`, progress);
    
    if (!progress) {
      return { isCompleted: false, status: 'not_started' };
    }
    
    if (progress.is_completed) {
      return {
        isCompleted: true,
        status: 'completed',
        score: progress.final_score || progress.score,
        grade: progress.final_letter_grade,
        completedAt: progress.completed_at
      };
    }
    
    return {
      isCompleted: false,
      status: 'in_progress',
      progressStep: progress.progress_step
    };
  };

  // Render completion badge
  const renderCompletionBadge = (planId) => {
    const completion = getCompletionStatus(planId);
    
    if (completion.status === 'completed') {
      return (
        <View style={styles.completionBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.completionText}>
            Completed {completion.grade ? `(${completion.grade})` : ''}
          </Text>
        </View>
      );
    } else if (completion.status === 'in_progress') {
      return (
        <View style={[styles.completionBadge, styles.inProgressBadge]}>
          <Ionicons name="time-outline" size={16} color="#FF9800" />
          <Text style={[styles.completionText, styles.inProgressText]}>
            In Progress
          </Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.completionBadge, styles.notStartedBadge]}>
        <Ionicons name="play-circle-outline" size={16} color="#666" />
        <Text style={[styles.completionText, styles.notStartedText]}>
          Not Started
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#176BB7" />
        <Text style={styles.loadingText}>Loading design plans...</Text>
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
        <Text style={styles.headerTitle}>Design Plans</Text>
        {refreshing && (
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 8 }} />
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          {/* Class Banner */}
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
            
            <Text style={styles.classDescription}>
              {classDetails?.class_description || "Work on design plans created by your instructor to enhance your understanding of architectural and construction concepts."}
            </Text>
          </View>

          {/* Debug Info
          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>Debug Info:</Text>
              <Text style={styles.debugText}>User ID: {userId}</Text>
              <Text style={styles.debugText}>Class ID: {classId}</Text>
              <Text style={styles.debugText}>Design Plans: {designPlans.length}</Text>
              <Text style={styles.debugText}>Progress Records: {Object.keys(studentProgress).length}</Text>
              
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={refreshStudentProgress}
              >
                <Text style={styles.debugButtonText}>Refresh Progress</Text>
              </TouchableOpacity>
            </View>
          )} */}

          {/* Design Plans */}
          <View style={styles.designPlanContainer}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="document-text" size={22} color="#176BB7" />
              <Text style={styles.sectionTitle}>Design Plans</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={refreshStudentProgress}
                disabled={refreshing}
              >
                <Ionicons 
                  name="refresh" 
                  size={20} 
                  color={refreshing ? "#ccc" : "#176BB7"} 
                />
              </TouchableOpacity>
            </View>
            
            {designPlans.length > 0 ? (
              designPlans.map((plan, index) => {
                const completion = getCompletionStatus(plan.id);
                
                return (
                  <View key={plan.id || index} style={[
                    styles.planItem,
                    completion.isCompleted && styles.completedPlanItem
                  ]}>
                    <View style={styles.planIconContainer}>
                      <Ionicons 
                        name={completion.isCompleted ? "checkmark-circle" : "document-text-outline"} 
                        size={28} 
                        color={completion.isCompleted ? "#4CAF50" : "#176BB7"} 
                      />
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={styles.planTitle}>
                        {plan.plan_name || `Design Plan ${index + 1}`}
                      </Text>
                      <Text style={styles.planDescription} numberOfLines={2}>
                        {plan.description || "No description available"}
                      </Text>
                      {renderCompletionBadge(plan.id)}
                      {completion.isCompleted && completion.completedAt && (
                        <Text style={styles.completedDate}>
                          Completed: {new Date(completion.completedAt).toLocaleDateString()}
                        </Text>
                      )}
                      {completion.isCompleted && completion.score && (
                        <Text style={styles.scoreText}>
                          Score: {completion.score}/100
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity 
                      style={[
                        styles.planButton,
                        completion.isCompleted && styles.completedPlanButton
                      ]}
                      onPress={() => handleStartDesign(plan)}
                    >
                      <Text style={[
                        styles.planButtonText,
                        completion.isCompleted && styles.completedPlanButtonText
                      ]}>
                        {completion.isCompleted ? "Review" : "Start"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#B4D4FF" />
                <Text style={styles.emptyStateText}>
                  No design plans found for this class
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain the same as previous version
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
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
    flex: 1,
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
  debugInfo: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  debugText: {
    fontSize: 12,
    color: '#E65100',
    marginBottom: 2,
  },
  debugButton: {
    backgroundColor: '#FFE0B2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  debugButtonText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '600',
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
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#B4D4FF',
  },
  completedPlanItem: {
    backgroundColor: '#F0F8F0',
    borderLeftColor: '#4CAF50',
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
    marginBottom: 8,
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  inProgressBadge: {
    backgroundColor: '#FFF3E0',
  },
  notStartedBadge: {
    backgroundColor: '#F5F5F5',
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  inProgressText: {
    color: '#FF9800',
  },
  notStartedText: {
    color: '#666',
  },
  completedDate: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  planButton: {
    backgroundColor: '#B4D4FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  completedPlanButton: {
    backgroundColor: '#C8E6C9',
  },
  planButtonText: {
    color: '#1E4F91',
    fontWeight: '600',
    fontSize: 14,
  },
  completedPlanButtonText: {
    color: '#2E7D32',
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
  },
});

export default DesignPlanViewer;