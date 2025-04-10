// client/src/contexts/CreateProjectContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { projectService } from '../services/ApiService';

interface FormData {
  title: string;
  category: string;
  short_description: string;
  full_description: string;
  impact_statement: string;
  target_location: string;
  duration_months: number;
  selected_sdgs: string[];
  funding_goal: number;
  min_investment: number;
  milestones: Array<{
    title: string;
    description: string;
    expected_completion_date: string;
    funding_percentage: number;
    verification_method: string;
  }>;
  documents: File[];
  team_members: Array<{
    name: string;
    role: string;
    bio: string;
  }>;
}

interface CreateProjectContextType {
  formData: FormData;
  currentStep: number;
  loading: boolean;
  error: string | null;
  setFormValue: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  addMilestone: () => void;
  removeMilestone: (index: number) => void;
  updateMilestone: (index: number, field: string, value: any) => void;
  addTeamMember: () => void;
  removeTeamMember: (index: number) => void;
  updateTeamMember: (index: number, field: string, value: string) => void;
  addDocuments: (files: FileList) => void;
  removeDocument: (index: number) => void;
  submitProject: () => Promise<string>;
  validateCurrentStep: () => boolean;
  validationErrors: Record<string, string>;
}

// Default form data
const defaultFormData: FormData = {
  title: '',
  category: '',
  short_description: '',
  full_description: '',
  impact_statement: '',
  target_location: '',
  duration_months: 12,
  selected_sdgs: [],
  funding_goal: 0,
  min_investment: 1000,
  milestones: [
    {
      title: '',
      description: '',
      expected_completion_date: '',
      funding_percentage: 0,
      verification_method: '',
    }
  ],
  documents: [],
  team_members: [
    {
      name: '',
      role: '',
      bio: '',
    }
  ],
};

const CreateProjectContext = createContext<CreateProjectContextType | undefined>(undefined);

export const CreateProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>({ ...defaultFormData });
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update form field
  const setFormValue = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error when field is updated
    if (validationErrors[field as string]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Step navigation
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Milestone management
  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          title: '',
          description: '',
          expected_completion_date: '',
          funding_percentage: 0,
          verification_method: '',
        }
      ],
    }));
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedMilestones = [...prev.milestones];
      updatedMilestones[index] = {
        ...updatedMilestones[index],
        [field]: value,
      };
      return {
        ...prev,
        milestones: updatedMilestones,
      };
    });
    
    // Clear validation error
    if (validationErrors[`milestone_${index}_${field}`]) {
      setValidationErrors(prev => ({
        ...prev,
        [`milestone_${index}_${field}`]: '',
      }));
    }
  };

  // Team member management
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      team_members: [
        ...prev.team_members,
        {
          name: '',
          role: '',
          bio: '',
        }
      ],
    }));
  };

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter((_, i) => i !== index),
    }));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedTeamMembers = [...prev.team_members];
      updatedTeamMembers[index] = {
        ...updatedTeamMembers[index],
        [field]: value,
      };
      return {
        ...prev,
        team_members: updatedTeamMembers,
      };
    });
    
    // Clear validation error
    if (validationErrors[`team_${index}_${field}`]) {
      setValidationErrors(prev => ({
        ...prev,
        [`team_${index}_${field}`]: '',
      }));
    }
  };

  // Document management
  const addDocuments = (files: FileList) => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...Array.from(files)],
    }));
    
    if (validationErrors.documents) {
      setValidationErrors(prev => ({
        ...prev,
        documents: '',
      }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  // Validation by step
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Basic Information
        if (!formData.title.trim()) {
          errors.title = 'Project title is required';
        }
        if (!formData.category) {
          errors.category = 'Category is required';
        }
        if (!formData.short_description.trim()) {
          errors.short_description = 'Short description is required';
        } else if (formData.short_description.length > 200) {
          errors.short_description = 'Short description must be 200 characters or less';
        }
        
        // Validate first team member
        if (!formData.team_members[0].name.trim()) {
          errors['team_0_name'] = 'Team member name is required';
        }
        if (!formData.team_members[0].role.trim()) {
          errors['team_0_role'] = 'Team member role is required';
        }
        break;
        
      case 1: // Project Details
        if (!formData.full_description.trim()) {
          errors.full_description = 'Full description is required';
        }
        if (!formData.impact_statement.trim()) {
          errors.impact_statement = 'Impact statement is required';
        }
        if (formData.selected_sdgs.length === 0) {
          errors.selected_sdgs = 'At least one SDG must be selected';
        }
        if (!formData.target_location.trim()) {
          errors.target_location = 'Target location is required';
        }
        break;
        
      case 2: // Funding & Milestones
        if (formData.funding_goal <= 0) {
          errors.funding_goal = 'Funding goal must be greater than 0';
        }
        if (formData.min_investment <= 0) {
          errors.min_investment = 'Minimum investment must be greater than 0';
        }
        if (formData.min_investment > formData.funding_goal) {
          errors.min_investment = 'Minimum investment cannot be greater than funding goal';
        }
        
        // Validate milestones
        let totalPercentage = 0;
        formData.milestones.forEach((milestone, index) => {
          if (!milestone.title.trim()) {
            errors[`milestone_${index}_title`] = 'Milestone title is required';
          }
          if (!milestone.description.trim()) {
            errors[`milestone_${index}_description`] = 'Milestone description is required';
          }
          if (!milestone.expected_completion_date) {
            errors[`milestone_${index}_expected_completion_date`] = 'Expected completion date is required';
          }
          if (milestone.funding_percentage <= 0) {
            errors[`milestone_${index}_funding_percentage`] = 'Funding percentage must be greater than 0';
          }
          
          totalPercentage += milestone.funding_percentage;
        });
        
        if (totalPercentage !== 100) {
          errors.milestone_total = 'Total funding percentage must equal 100%';
        }
        break;
        
      case 3: // Documents
        if (formData.documents.length === 0) {
          errors.documents = 'At least one document is required';
        }
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit project to API
  const submitProject = async (): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      // Create form data for API call
      const projectFormData = new FormData();
      
      // Add project metadata
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'documents' || key === 'milestones' || key === 'team_members') {
          return; // Handle these separately
        }
        
        if (key === 'selected_sdgs') {
          projectFormData.append(key, JSON.stringify(value));
        } else {
          projectFormData.append(key, String(value));
        }
      });
      
      // Add milestones and team members
      projectFormData.append('milestones', JSON.stringify(formData.milestones));
      projectFormData.append('team_members', JSON.stringify(formData.team_members));
      
      // Add documents
      formData.documents.forEach((doc, index) => {
        projectFormData.append(`document_${index}`, doc);
      });
      
      // Submit project
      const response = await projectService.createProject(projectFormData);
      return response.project_id;
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreateProjectContext.Provider
      value={{
        formData,
        currentStep,
        loading,
        error,
        setFormValue,
        nextStep,
        prevStep,
        goToStep,
        addMilestone,
        removeMilestone,
        updateMilestone,
        addTeamMember,
        removeTeamMember,
        updateTeamMember,
        addDocuments,
        removeDocument,
        submitProject,
        validateCurrentStep,
        validationErrors,
      }}
    >
      {children}
    </CreateProjectContext.Provider>
  );
};

export const useCreateProject = () => {
  const context = useContext(CreateProjectContext);
  if (context === undefined) {
    throw new Error('useCreateProject must be used within a CreateProjectProvider');
  }
  return context;
};