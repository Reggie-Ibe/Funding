import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Card,
  CardContent,
  InputAdornment,
  useTheme,
  styled,
  Alert,
} from '@mui/material';
import {
  AttachMoney,
  BusinessCenter,
  Description,
  Group,
  Timeline,
  Check,
  Insights,
  Comment,
  Share,
  FavoriteBorder,
  Download,
  CalendarToday,
  LocationOn,
  Person,
  ArrowBack,
} from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { projectService, investmentService } from '../services/ApiService';

// Styled components
const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Interface for project data
interface ProjectData {
  project_id: string;
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  status: string;
  funding_goal: number;
  current_funding: number;
  min_investment: number;
  investors_count: number;
  created_at: string;
  duration_months: number;
  target_location: string;
  selected_sdgs: string[];
  impact_statement: string;
  innovator_id: string;
  innovator_name?: string;
  // Additional properties
  milestones: any[];
  team_members: any[];
  documents: any[];
  updates: any[];
}

const ProjectDetails: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState(0);
  const [confirmInvestDialogOpen, setConfirmInvestDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [investmentSuccess, setInvestmentSuccess] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch project details
        const projectDetails = await projectService.getProjectById(id);
        
        // Set initial invest amount to minimum investment
        setInvestAmount(projectDetails.min_investment);
        
        // Set project data
        setProjectData(projectDetails);
      } catch (err: any) {
        console.error('Error fetching project details:', err);
        setError(err.response?.data?.message || 'Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleInvestClick = () => {
    setInvestDialogOpen(true);
  };
  
  const handleInvestDialogClose = () => {
    setInvestDialogOpen(false);
    if (projectData) {
      setInvestAmount(projectData.min_investment);
    }
  };
  
  const handleProceedToConfirm = () => {
    setInvestDialogOpen(false);
    setConfirmInvestDialogOpen(true);
  };
  
  const handleConfirmDialogClose = () => {
    setConfirmInvestDialogOpen(false);
  };
  
  const handleConfirmInvestment = async () => {
    if (!projectData || !id) return;
    
    setProcessing(true);
    
    try {
      // Call investment API
      await investmentService.investInProject(id, {
        amount: investAmount
      });
      
      // Show success message
      setInvestmentSuccess(true);
      
      // Refresh project data after short delay
      setTimeout(async () => {
        const updatedProject = await projectService.getProjectById(id);
        setProjectData(updatedProject);
        setConfirmInvestDialogOpen(false);
        setInvestmentSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error processing investment:', error);
      setError(error.response?.data?.message || 'Failed to process investment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  const getFundingProgress = () => {
    if (!projectData) return 0;
    return (projectData.current_funding / projectData.funding_goal) * 100;
  };
  
  if (loading) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }
  
  if (error || !projectData) {
    return (
      <AppLayout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Failed to load project details. Please try again.'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/projects')}
        >
          Back to Projects
        </Button>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Button
            variant="text"
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/projects')}
            sx={{ mr: 2 }}
          >
            Back to Projects
          </Button>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {projectData.title}
          </Typography>
        </Box>
        
        <GradientDivider />
        
        <Grid container spacing={3}>
          {/* Project Overview */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Chip
                        label={projectData.category}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={projectData.status.replace('_', ' ')}
                        color={
                          projectData.status === 'SeekingFunding' || projectData.status === 'seeking_funding'
                            ? 'primary'
                            : projectData.status === 'PartiallyFunded' || projectData.status === 'partially_funded'
                            ? 'warning'
                            : 'success'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1">
                      {projectData.short_description}
                    </Typography>
                  </Box>
                  <Box display="flex">
                    <IconButton>
                      <FavoriteBorder />
                    </IconButton>
                    <IconButton>
                      <Share />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Funding Progress
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      {getFundingProgress().toFixed(0)}% Funded
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${projectData.current_funding.toLocaleString()} of ${projectData.funding_goal.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getFundingProgress()}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {projectData.investors_count} investors
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Min. Investment: ${projectData.min_investment.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
                  <Box display="flex" alignItems="center">
                    <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Duration: {projectData.duration_months} months
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Location: {projectData.target_location}
                    </Typography>
                  </Box>
                </Box>
                
                {/* SDGs */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sustainable Development Goals:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {projectData.selected_sdgs.map((sdg) => (
                      <Chip key={sdg} label={sdg.split(':')[0]} size="small" />
                    ))}
                  </Box>
                </Box>
                
                {user?.role === 'Investor' && 
                 (projectData.status === 'SeekingFunding' || projectData.status === 'seeking_funding' || 
                  projectData.status === 'PartiallyFunded' || projectData.status === 'partially_funded') && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<AttachMoney />}
                    onClick={handleInvestClick}
                    sx={{ mt: 2 }}
                  >
                    Invest in This Project
                  </Button>
                )}
              </Box>
            </Paper>
            
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Tab label="Overview" icon={<Description />} iconPosition="start" />
                <Tab label="Team" icon={<Group />} iconPosition="start" />
                <Tab label="Milestones" icon={<Timeline />} iconPosition="start" />
                <Tab label="Impact" icon={<Insights />} iconPosition="start" />
                <Tab label="Updates" icon={<Comment />} iconPosition="start" />
              </Tabs>
              
              {/* Overview Tab */}
              <TabPanel value={tabValue} index={0}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {projectData.full_description}
                </Typography>
                
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Documents
                </Typography>
                <List>
                  {projectData.documents && projectData.documents.map((doc, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        mb: 1, 
                        borderRadius: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: theme.palette.primary.main }}>
                          <Description />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={doc.document_name || doc.name}
                        secondary={`${((doc.file_size || doc.size) / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <Button startIcon={<Download />}>Download</Button>
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
              
              {/* Team Tab */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  {projectData.team_members && projectData.team_members.map((member, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={2}>
                            <Avatar 
                              sx={{ width: 60, height: 60, mr: 2 }}
                            >
                              {member.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6">{member.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {member.role}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2">{member.bio}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>
              
              {/* Milestones Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Project Timeline
                  </Typography>
                  {projectData.milestones && projectData.milestones.map((milestone, index) => (
                    <Box
                      key={milestone.milestone_id}
                      sx={{
                        position: 'relative',
                        mb: 3,
                        pb: 3,
                        borderLeft: `2px solid ${theme.palette.divider}`,
                        pl: 3,
                        '&:last-child': {
                          mb: 0,
                          pb: 0,
                          borderLeft: 'none',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -9,
                          top: 0,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: milestone.status === 'Completed' || milestone.status === 'Approved' 
                            ? theme.palette.success.main 
                            : theme.palette.primary.main,
                          border: `2px solid ${theme.palette.background.paper}`,
                        }}
                      />
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6">
                            {milestone.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Expected: {new Date(milestone.target_completion_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${milestone.funding_required ? ((milestone.funding_required / projectData.funding_goal) * 100).toFixed(0) : ''}%`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {milestone.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Verification: {milestone.verification_method}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </TabPanel>
              
              {/* Impact Tab */}
              <TabPanel value={tabValue} index={3}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {projectData.impact_statement}
                </Typography>
              </TabPanel>
              
              {/* Updates Tab */}
              <TabPanel value={tabValue} index={4}>
                {projectData.updates && projectData.updates.map((update, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 3,
                      mb: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6">{update.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(update.created_at || update.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">{update.content}</Typography>
                  </Paper>
                ))}
              </TabPanel>
            </Paper>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Creator
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar 
                  sx={{ width: 50, height: 50, mr: 2 }}
                >
                  {projectData.innovator_name ? projectData.innovator_name.charAt(0) : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {projectData.innovator_name || 'Project Creator'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Innovator
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Person />}
                sx={{ mb: 2 }}
              >
                View Profile
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Comment />}
              >
                Contact Creator
              </Button>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Investment Summary
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Funding Goal"
                    secondary={`${projectData.funding_goal.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Current Funding"
                    secondary={`${projectData.current_funding.toLocaleString()} (${getFundingProgress().toFixed(0)}%)`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Minimum Investment"
                    secondary={`${projectData.min_investment.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Number of Investors"
                    secondary={projectData.investors_count}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Project Created"
                    secondary={new Date(projectData.created_at).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Similar Projects
              </Typography>
              <List>
                <ListItem
                  component="div"
                  sx={{
                    mb: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/projects/proj_002')}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <BusinessCenter />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Clean Water Initiative"
                    secondary="Water purification technology for rural communities"
                  />
                </ListItem>
                <ListItem
                  component="div"
                  sx={{
                    mb: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/projects/proj_003')}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <BusinessCenter />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Digital Farming Assistant"
                    secondary="Mobile app for smallholder farmers"
                  />
                </ListItem>
                <ListItem
                  component="div"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/projects/proj_004')}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.tertiary ? theme.palette.tertiary.main : '#FF9800' }}>
                      <BusinessCenter />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Sustainable Drip Irrigation"
                    secondary="Low-cost irrigation solutions for dry regions"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Investment Dialog */}
        <Dialog open={investDialogOpen} onClose={handleInvestDialogClose}>
          <DialogTitle>Invest in {projectData.title}</DialogTitle>
          <DialogContent>
            <DialogContentText gutterBottom>
              How much would you like to invest? The minimum investment is ${projectData.min_investment.toLocaleString()}.
            </DialogContentText>
            <TextField
              fullWidth
              label="Investment Amount"
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: projectData.min_investment },
              }}
              error={investAmount < projectData.min_investment}
              helperText={
                investAmount < projectData.min_investment
                  ? `Minimum investment is ${projectData.min_investment.toLocaleString()}`
                  : ''
              }
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleInvestDialogClose}>Cancel</Button>
            <Button
              onClick={handleProceedToConfirm}
              variant="contained"
              color="primary"
              disabled={investAmount < projectData.min_investment}
            >
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Confirm Investment Dialog */}
        <Dialog open={confirmInvestDialogOpen} onClose={handleConfirmDialogClose}>
          <DialogTitle>Confirm Your Investment</DialogTitle>
          <DialogContent>
            {investmentSuccess ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                Investment successful! Your funds have been allocated to this project.
              </Alert>
            ) : (
              <>
                <DialogContentText gutterBottom>
                  Please confirm your investment of ${investAmount.toLocaleString()} in {projectData.title}.
                </DialogContentText>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  By confirming, you agree to our investment terms and conditions. Funds will be held in escrow and released according to the milestone schedule.
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmDialogClose} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmInvestment}
              variant="contained"
              color="primary"
              disabled={processing || investmentSuccess}
              startIcon={processing ? <CircularProgress size={20} /> : null}
            >
              {processing ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
};

export default ProjectDetails;