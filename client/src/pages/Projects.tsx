import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Pagination,
  useTheme,
  styled,
  CircularProgress,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  AttachMoney,
  Business,
  Add,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectsContext';

// Styled components
const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
}));

const Projects: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, loading, error, filters, setFilters, fetchProjects } = useProjects();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const projectsPerPage = 6;

  // Categories from the API
  const [categories, setCategories] = useState<string[]>(['All']);
  
  // Effect to apply filters when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Build filter object
      const newFilters = {
        search: searchQuery,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        sortBy
      };
      
      setFilters(newFilters);
      fetchProjects(newFilters);
      setPage(1); // Reset to first page when filters change
    }, 500); // Debounce filter changes
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, categoryFilter, statusFilter, sortBy, setFilters, fetchProjects]);

  // Fetch unique categories on first load
  useEffect(() => {
    const getCategories = async () => {
      try {
        // In a real implementation, you'd call an API endpoint for categories
        // For now, extract unique categories from projects
        const uniqueCategories = Array.from(
          new Set(projects.map(project => project.category))
        );
        setCategories(['All', ...uniqueCategories]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    if (projects.length > 0) {
      getCategories();
    }
  }, [projects]);
  
  // Pagination
  const indexOfLastProject = page * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'seekingfunding':
      case 'seeking_funding':
        return theme.palette.primary.main;
      case 'partiallyfunded':
      case 'partially_funded':
        return theme.palette.warning.main;
      case 'fullyfunded':
      case 'fully_funded':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };
  
  const getFundingProgress = (current: number, goal: number) => {
    return (current / goal) * 100;
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategoryFilter(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value);
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Projects
          </Typography>
          {user?.role === 'Innovator' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => navigate('/projects/create')}
            >
              Create Project
            </Button>
          )}
        </Box>
        
        <GradientDivider />
        
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Grid>
            <Grid item xs={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  onChange={handleSortChange}
                  label="Sort By"
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="most_funded">Most Funded</MenuItem>
                  <MenuItem value="least_funded">Least Funded</MenuItem>
                  <MenuItem value="highest_goal">Highest Goal</MenuItem>
                  <MenuItem value="lowest_goal">Lowest Goal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {showFilters && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select
                      labelId="category-filter-label"
                      value={categoryFilter}
                      onChange={handleCategoryChange}
                      label="Category"
                    >
                      {categories.map(category => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={statusFilter}
                      onChange={handleStatusChange}
                      label="Status"
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="SeekingFunding">Seeking Funding</MenuItem>
                      <MenuItem value="PartiallyFunded">Partially Funded</MenuItem>
                      <MenuItem value="FullyFunded">Fully Funded</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
        
        {/* Loading and Error states */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {!loading && !error && currentProjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No projects found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {currentProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.project_id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        height: 180,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                          p: 1,
                          zIndex: 1,
                        }}
                      >
                        <Chip
                          label={project.status.replace('_', ' ')}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(project.status),
                            color: 'white',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom>
                        {project.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Business fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {project.category}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {project.short_description}
                      </Typography>
                      
                      <Box sx={{ mt: 'auto' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Funding Progress
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {Math.round(getFundingProgress(project.current_funding, project.funding_goal))}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 1,
                            mb: 2,
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              height: '100%',
                              width: `${getFundingProgress(project.current_funding, project.funding_goal)}%`,
                              borderRadius: 1,
                              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2" fontWeight="medium">
                            ${project.current_funding.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            of ${project.funding_goal.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<Visibility />}
                            onClick={() => handleProjectClick(project.project_id)}
                          >
                            Details
                          </Button>
                          {user?.role === 'Investor' && 
                           (project.status === 'SeekingFunding' || 
                            project.status === 'seeking_funding' || 
                            project.status === 'PartiallyFunded' ||
                            project.status === 'partially_funded') && (
                            <Button
                              variant="contained"
                              color="secondary"
                              fullWidth
                              startIcon={<AttachMoney />}
                              onClick={() => handleProjectClick(project.project_id)}
                            >
                              Invest
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {projects.length > projectsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(projects.length / projectsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </AppLayout>
  );
};

export default Projects;