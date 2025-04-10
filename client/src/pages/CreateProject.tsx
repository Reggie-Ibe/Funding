import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  IconButton,
  styled,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  ArrowBack, 
  ArrowForward, 
  Check,
  Add,
  Delete,
  AttachFile,
  UploadFile,
  Description,
  CloudUpload,
} from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { CreateProjectProvider, useCreateProject } from '../contexts/CreateProjectContext';

// Styled components
const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
}));

// Step titles
const steps = ['Basic Information', 'Project Details', 'Funding & Milestones', 'Documents', 'Review & Submit'];

// Sustainable Development Goals (SDGs)
const sdgs = [
  'SDG 1: No Poverty',
  'SDG 2: Zero Hunger',
  'SDG 3: Good Health and Well-being',
  'SDG 4: Quality Education',
  'SDG 5: Gender Equality',
  'SDG 6: Clean Water and Sanitation',
  'SDG 7: Affordable and Clean Energy',
  'SDG 8: Decent Work and Economic Growth',
  'SDG 9: Industry, Innovation and Infrastructure',
  'SDG 10: Reduced Inequality',
  'SDG 11: Sustainable Cities and Communities',
  'SDG 12: Responsible Consumption and Production',
  'SDG 13: Climate Action',
  'SDG 14: Life Below Water',
  'SDG 15: Life on Land',
  'SDG 16: Peace, Justice and Strong Institutions',
  'SDG 17: Partnerships for the Goals',
];

// Project categories
const categories = [
  'AgriTech',
  'CleanTech',
  'Energy',
  'HealthTech',
  'EdTech',
  'FinTech',
  'WaterTech',
  'Infrastructure',
  'Conservation',
  'Other',
];

// CreateProject wrapper component to provide context
const CreateProjectWrapper: React.FC = () => (
  <CreateProjectProvider>
    <CreateProjectForm />
  </CreateProjectProvider>
);

// Main form component
const CreateProjectForm: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    formData, 
    currentStep, 
    loading, 
    error, 
    setFormValue, 
    nextStep, 
    prevStep, 
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
    validationErrors
  } = useCreateProject();
  
  // Redirect non-innovators
  if (user?.role !== 'Innovator') {
    return (
      <AppLayout>
        <Alert severity="error" sx={{ mb: 3 }}>
          Only Innovators can create projects. Please contact support if you believe this is an error.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </AppLayout>
    );
  }

  // Handle SDG selection
  const handleSDGChange = (event: SelectChangeEvent<typeof formData.selected_sdgs>) => {
    const { target: { value } } = event;
    setFormValue('selected_sdgs', typeof value === 'string' ? value.split(',') : value);
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addDocuments(e.target.files);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (validateCurrentStep()) {
      try {
        const projectId = await submitProject();
        navigate(`/projects/${projectId}`, { 
          state: { message: 'Project created successfully! It is now pending approval.' }
        });
      } catch (err) {
        console.error('Failed to submit project:', err);
      }
    }
  };
  
  // Render step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormValue('title', e.target.value)}
                error={!!validationErrors.title}
                helperText={validationErrors.title}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!validationErrors.category} required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormValue('category', e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.category && <FormHelperText>{validationErrors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Duration (months)"
                name="duration_months"
                type="number"
                value={formData.duration_months}
                onChange={(e) => setFormValue('duration_months', parseInt(e.target.value))}
                InputProps={{
                  inputProps: { min: 1, max: 60 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Description (200 characters max)"
                name="short_description"
                value={formData.short_description}
                onChange={(e) => setFormValue('short_description', e.target.value)}
                error={!!validationErrors.short_description}
                helperText={validationErrors.short_description || `${formData.short_description.length}/200`}
                required
                multiline
                rows={2}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              {formData.team_members.map((member, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        Team Member {index + 1}
                      </Typography>
                      {index > 0 && (
                        <IconButton color="error" onClick={() => removeTeamMember(index)}>
                          <Delete />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={member.name}
                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                        required={index === 0}
                        error={!!validationErrors[`team_${index}_name`]}
                        helperText={validationErrors[`team_${index}_name`]}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Role"
                        value={member.role}
                        onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                        required={index === 0}
                        error={!!validationErrors[`team_${index}_role`]}
                        helperText={validationErrors[`team_${index}_role`]}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        value={member.bio}
                        onChange={(e) => updateTeamMember(index, 'bio', e.target.value)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                startIcon={<Add />}
                onClick={addTeamMember}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Team Member
              </Button>
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Project Description"
                name="full_description"
                value={formData.full_description}
                onChange={(e) => setFormValue('full_description', e.target.value)}
                error={!!validationErrors.full_description}
                helperText={validationErrors.full_description}
                required
                multiline
                rows={6}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Impact Statement"
                name="impact_statement"
                value={formData.impact_statement}
                onChange={(e) => setFormValue('impact_statement', e.target.value)}
                error={!!validationErrors.impact_statement}
                helperText={validationErrors.impact_statement}
                required
                multiline
                rows={3}
                placeholder="Describe the social, environmental, or economic impact of your project"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Target Location/Region"
                name="target_location"
                value={formData.target_location}
                onChange={(e) => setFormValue('target_location', e.target.value)}
                error={!!validationErrors.target_location}
                helperText={validationErrors.target_location}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!validationErrors.selected_sdgs} required>
                <InputLabel id="sdg-label">Sustainable Development Goals</InputLabel>
                <Select
                  labelId="sdg-label"
                  multiple
                  value={formData.selected_sdgs}
                  onChange={handleSDGChange}
                  input={<OutlinedInput label="Sustainable Development Goals" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value.split(':')[0]} />
                      ))}
                    </Box>
                  )}
                >
                  {sdgs.map((sdg) => (
                    <MenuItem key={sdg} value={sdg}>
                      {sdg}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.selected_sdgs && <FormHelperText>{validationErrors.selected_sdgs}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Funding Goal ($)"
                name="funding_goal"
                type="number"
                value={formData.funding_goal}
                onChange={(e) => setFormValue('funding_goal', Number(e.target.value))}
                error={!!validationErrors.funding_goal}
                helperText={validationErrors.funding_goal}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 1000 },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Investment ($)"
                name="min_investment"
                type="number"
                value={formData.min_investment}
                onChange={(e) => setFormValue('min_investment', Number(e.target.value))}
                error={!!validationErrors.min_investment}
                helperText={validationErrors.min_investment}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 100 },
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Project Milestones
              </Typography>
              {validationErrors.milestone_total && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {validationErrors.milestone_total}
                </Typography>
              )}
              
              {formData.milestones.map((milestone, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        Milestone {index + 1}
                      </Typography>
                      {index > 0 && (
                        <IconButton color="error" onClick={() => removeMilestone(index)}>
                          <Delete />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Milestone Title"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        error={!!validationErrors[`milestone_${index}_title`]}
                        helperText={validationErrors[`milestone_${index}_title`]}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Funding (%)"
                        type="number"
                        value={milestone.funding_percentage}
                        onChange={(e) => updateMilestone(index, 'funding_percentage', Number(e.target.value))}
                        error={!!validationErrors[`milestone_${index}_funding_percentage`]}
                        helperText={validationErrors[`milestone_${index}_funding_percentage`]}
                        required
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          inputProps: { min: 1, max: 100 },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Milestone Description"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                        error={!!validationErrors[`milestone_${index}_description`]}
                        helperText={validationErrors[`milestone_${index}_description`]}
                        required
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Expected Completion Date"
                        type="date"
                        value={milestone.expected_completion_date}
                        onChange={(e) => updateMilestone(index, 'expected_completion_date', e.target.value)}
                        error={!!validationErrors[`milestone_${index}_expected_completion_date`]}
                        helperText={validationErrors[`milestone_${index}_expected_completion_date`]}
                        required
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Verification Method"
                        value={milestone.verification_method}
                        onChange={(e) => updateMilestone(index, 'verification_method', e.target.value)}
                        placeholder="How will this milestone be verified?"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              
              <Button
                startIcon={<Add />}
                onClick={addMilestone}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Milestone
              </Button>
            </Grid>
          </Grid>
        );
        
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <UploadContainer>
                <Typography variant="h6" gutterBottom>
                  Upload Project Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload business plan, technical specifications, or other supporting documents
                </Typography>
                
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUpload />}
                  sx={{ mt: 2 }}
                >
                  Upload Files
                  <VisuallyHiddenInput
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                  />
                </Button>
                
                {validationErrors.documents && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {validationErrors.documents}
                  </Typography>
                )}
              </UploadContainer>
            </Grid>
            
            {formData.documents.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Uploaded Documents
                </Typography>
                <List>
                  {formData.documents.map((doc, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => removeDocument(index)}>
                          <Delete />
                        </IconButton>
                      }
                      sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', mb: 1, borderRadius: 1 }}
                    >
                      <ListItemText
                        primary={doc.name}
                        secondary={`${(doc.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        );
        
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <Typography variant="h6" gutterBottom>
                Project Summary
              </Typography>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Project Title
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Short Description
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.short_description}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Funding Goal
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      ${formData.funding_goal.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Minimum Investment
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      ${formData.min_investment.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Target Location
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.target_location}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Project Duration
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.duration_months} months
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      SDGs Alignment
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {formData.selected_sdgs.map((sdg) => (
                        <Chip key={sdg} label={sdg.split(':')[0]} size="small" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                {formData.team_members.map((member, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      {member.name} - {member.role}
                    </Typography>
                    {member.bio && (
                      <Typography variant="body2" color="text.secondary">
                        {member.bio}
                      </Typography>
                    )}
                    {index < formData.team_members.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Milestones
              </Typography>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                {formData.milestones.map((milestone, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        {milestone.title}
                      </Typography>
                      <Chip 
                        label={`${milestone.funding_percentage}%`} 
                        color="primary" 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {milestone.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Expected completion: {milestone.expected_completion_date ? new Date(milestone.expected_completion_date).toLocaleDateString() : 'Not set'}
                    </Typography>
                    {index < formData.milestones.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Documents
              </Typography>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <List dense>
                  {formData.documents.map((doc, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={doc.name}
                        secondary={`${(doc.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                By submitting this project, you agree to our terms and conditions. Your project will be reviewed by our team before being published.
              </Typography>
            </Grid>
          </Grid>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <AppLayout>
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: "bold",
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Create New Project
      </Typography>
      
      <GradientDivider />
      
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {getStepContent(currentStep)}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="outlined"
          disabled={currentStep === 0}
          onClick={prevStep}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>
        {currentStep === steps.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            endIcon={loading ? <CircularProgress size={20} /> : <Check />}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Project'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={nextStep}
            endIcon={<ArrowForward />}
          >
            Next
          </Button>
        )}
      </Box>
    </AppLayout>
  );
};

export default CreateProjectWrapper;