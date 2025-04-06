import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress
} from '@mui/material';
import {
  LocalShipping,
  Inventory,
  CheckCircle,
  Warning,
  SwapHoriz,
  InfoOutlined,
  DataUsage
} from '@mui/icons-material';

// Import Google Maps component
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

// Constants
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Sample data for demo purposes - India-focused locations
const SAMPLE_PRODUCTS = [
  {"id": 1, "name": "Smartphone Model X Pro", "sku": "TECH-SP-001", "category": "Electronics", "price": 65999, "weight": 0.35},
  {"id": 2, "name": "Ultra Laptop 15", "sku": "TECH-LT-002", "category": "Electronics", "price": 89999, "weight": 2.5},
  {"id": 3, "name": "Premium Noise-Canceling Headphones", "sku": "AUDIO-HP-003", "category": "Audio", "price": 18999, "weight": 0.5},
  {"id": 4, "name": "Smartwatch Pro Series", "sku": "WEAR-SW-004", "category": "Wearables", "price": 29999, "weight": 0.1},
  {"id": 5, "name": "Portable Wireless Speaker", "sku": "AUDIO-BS-005", "category": "Audio", "price": 7999, "weight": 1.2},
  {"id": 6, "name": "4K QLED Smart TV 55\"", "sku": "TECH-TV-006", "category": "Electronics", "price": 105999, "weight": 25.0},
  {"id": 7, "name": "Mirrorless Digital Camera", "sku": "TECH-DC-007", "category": "Electronics", "price": 59999, "weight": 1.8},
  {"id": 8, "name": "Wireless Gaming Peripheral Set", "sku": "TECH-GM-008", "category": "Accessories", "price": 4999, "weight": 0.3},
  {"id": 9, "name": "Home Assistant Smart Speaker", "sku": "SMART-SP-009", "category": "Smart Home", "price": 8999, "weight": 0.8},
  {"id": 10, "name": "Professional Tablet Pro", "sku": "TECH-TB-010", "category": "Electronics", "price": 45999, "weight": 0.6},
];

// Updated with Indian locations focused on Bengaluru region
const SAMPLE_LOCATIONS = [
  {"id": 1, "name": "Bengaluru Central Warehouse", "address": "Electronic City Phase 1, Bengaluru, Karnataka", "lat": 12.8399, "lng": 77.6770, "type": "warehouse", "capacity": 10000, "preferred": true},
  {"id": 2, "name": "Whitefield Distribution Center", "address": "ITPL Main Road, Whitefield, Bengaluru", "lat": 12.9698, "lng": 77.7500, "type": "warehouse", "capacity": 8000, "preferred": true},
  {"id": 3, "name": "HSR Layout Fulfillment Hub", "address": "HSR Layout, Bengaluru, Karnataka", "lat": 12.9116, "lng": 77.6375, "type": "warehouse", "capacity": 12000, "preferred": true},
  {"id": 4, "name": "Mysuru Road Storage Facility", "address": "Mysuru Road, Bengaluru, Karnataka", "lat": 12.9456, "lng": 77.5177, "type": "warehouse", "capacity": 9000, "preferred": false},
  {"id": 5, "name": "Chennai Regional Warehouse", "address": "Ambattur Industrial Estate, Chennai, Tamil Nadu", "lat": 13.0837, "lng": 80.1548, "type": "warehouse", "capacity": 7500, "preferred": false},
  {"id": 6, "name": "Indiranagar Retail Store", "address": "100 Feet Road, Indiranagar, Bengaluru", "lat": 12.9784, "lng": 77.6408, "type": "retailer", "capacity": 1500, "preferred": true},
  {"id": 7, "name": "Koramangala Flagship Store", "address": "80 Feet Road, Koramangala, Bengaluru", "lat": 12.9347, "lng": 77.6205, "type": "retailer", "capacity": 1200, "preferred": true},
  {"id": 8, "name": "MG Road Retail Outlet", "address": "MG Road, Bengaluru, Karnataka", "lat": 12.9767, "lng": 77.6009, "type": "retailer", "capacity": 2000, "preferred": true},
  {"id": 9, "name": "Hyderabad Distribution Center", "address": "HITEC City, Hyderabad, Telangana", "lat": 17.4435, "lng": 78.3772, "type": "warehouse", "capacity": 8500, "preferred": false},
  {"id": 10, "name": "Mumbai Supply Hub", "address": "Andheri East, Mumbai, Maharashtra", "lat": 19.1136, "lng": 72.8697, "type": "warehouse", "capacity": 6500, "preferred": false},
  {"id": 11, "name": "Jayanagar Shopping Complex", "address": "4th Block, Jayanagar, Bengaluru", "lat": 12.9252, "lng": 77.5838, "type": "retailer", "capacity": 1300, "preferred": true},
  {"id": 12, "name": "BTM Layout Express Center", "address": "BTM 2nd Stage, Bengaluru, Karnataka", "lat": 12.9168, "lng": 77.6101, "type": "retailer", "capacity": 1100, "preferred": true},
  {"id": 13, "name": "Malleshwaram City Store", "address": "Sampige Road, Malleshwaram, Bengaluru", "lat": 13.0035, "lng": 77.5709, "type": "retailer", "capacity": 1250, "preferred": true},
  {"id": 14, "name": "Yelahanka Logistics Center", "address": "Yelahanka New Town, Bengaluru", "lat": 13.1005, "lng": 77.5963, "type": "warehouse", "capacity": 5500, "preferred": true},
  {"id": 15, "name": "Marathahalli Supply Point", "address": "Outer Ring Road, Marathahalli, Bengaluru", "lat": 12.9591, "lng": 77.6974, "type": "warehouse", "capacity": 4800, "preferred": true},
];

const DynamicRerouting = () => {
  // React Router navigation
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  
  // State for the multi-step process
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select Product & Destination', 'Find Source Locations', 'Review & Execute'];
  
  // Authentication and data loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Product and inventory data - using sample data directly
  const [availableProducts, setAvailableProducts] = useState(SAMPLE_PRODUCTS);
  const [availableLocations, setAvailableLocations] = useState(SAMPLE_LOCATIONS);
  const [isDataLoaded, setIsDataLoaded] = useState(true); // Set to true since we're using sample data
  
  // Form values
  const [selectedProduct, setSelectedProduct] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [requiredQuantity, setRequiredQuantity] = useState(1);
  const [maxSourceLocations, setMaxSourceLocations] = useState(3);
  
  // Results
  const [candidateLocations, setCandidateLocations] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [reroutingPlan, setReroutingPlan] = useState(null);
  
  // Dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Loading states
  const [searchingCandidates, setSearchingCandidates] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [executingPlan, setExecutingPlan] = useState(false);

  // New disruption parameters for Gemini API
  const [affectedUnitType, setAffectedUnitType] = useState('warehouse');
  const [affectedUnitId, setAffectedUnitId] = useState('');
  const [disruptionType, setDisruptionType] = useState('natural_disaster');
  const [affectedLocation, setAffectedLocation] = useState({});

  // Google Maps API
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });
  
  // Map center state - Update to center on Bengaluru by default
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Center on Bengaluru
  const [mapZoom, setMapZoom] = useState(10); // Zoom focused on city level

  useEffect(() => {
    // No need to fetch data since we're using sample data
    // If you want to simulate loading, you could use a setTimeout here
  }, []);

  const fetchInitialData = async () => {
    // No need to implement this since we're using sample data
    // This is just kept as a placeholder
  };

  const handleNext = () => {
    if (activeStep === 0) {
      prepareForPlanGeneration();
    } else if (activeStep === 1) {
      generateReroutingPlan();
    } else if (activeStep === 2) {
      setConfirmDialogOpen(true);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedProduct('');
    setDestinationLocation('');
    setRequiredQuantity(1);
    setCandidateLocations([]);
    setSelectedCandidates([]);
    setReroutingPlan(null);
    setError('');
    setSuccess('');
  };

  const prepareForPlanGeneration = async () => {
    // Validate form
    if (!affectedUnitType || !affectedUnitId || !disruptionType) {
      setError('Please fill out all required fields with valid values');
      return;
    }
    
    // Find the affected location from our available locations
    const affected = availableLocations.find(loc => loc.id.toString() === affectedUnitId.toString());
    if (!affected) {
      setError('Selected location not found');
      return;
    }
    setAffectedLocation(affected); // Store the selected affected location
    setError(''); // Clear previous errors
    
    // No longer using searchingCandidates here, directly move to next step
    // setSearchingCandidates(true); // Show loading indicator

    // // Calculate random delay (4 to 8 seconds) -- REMOVED
    // const delay = Math.floor(Math.random() * (8000 - 4000 + 1)) + 4000;
    
    // // Use setTimeout to add the delay -- REMOVED
    // setTimeout(() => {
    //   setSearchingCandidates(false); // Hide loading indicator
    //   setActiveStep(1); // Move to the next step
    // }, delay);
    
    // Directly move to the next step
    setActiveStep(1); 
  };

  const generateReroutingPlan = async () => {
    setLoading(true);
    setError('');
    setGeneratingPlan(true); // Keep this true during the delay and API call
    
    // Calculate random delay (4 to 8 seconds)
    const delay = Math.floor(Math.random() * (8000 - 4000 + 1)) + 4000;

    // Add delay before executing the API call and plan generation
    setTimeout(async () => {
      try {
        // Call the new Gemini API endpoint
        const response = await axios.post('/api/rerouting/dynamic/', {
          affected_unit_type: affectedUnitType,
          affected_unit_id: affectedUnitId,
          disruption_type: disruptionType,
          affected_location: affectedLocation.address || affectedLocation.name,
        });
        
        if (response.data) {
          setReroutingPlan(response.data);
          
          // If the response includes map visualization data, set center to the affected location
          if (response.data.visualization_data && 
              response.data.visualization_data.map_markers && 
              response.data.visualization_data.map_markers.length > 0) {
            
            const affectedMarker = response.data.visualization_data.map_markers.find(
              marker => marker.type === 'affected'
            );
            
            if (affectedMarker) {
              setMapCenter({ lat: affectedMarker.lat, lng: affectedMarker.lng });
              setMapZoom(6);
            }
          }
          
          setActiveStep(2); // Move to step 3 (Review) after successful plan generation
        } else {
          setError('Could not generate a valid rerouting plan');
        }
      } catch (err) {
        console.error('Error generating rerouting plan:', err);
        setError(err.response?.data?.error || 'Failed to generate rerouting plan');
      } finally {
        // Set loading states to false inside the finally block of the setTimeout callback
        setLoading(false);
        setGeneratingPlan(false);
      }
    }, delay); // Apply the delay here
  };

  const executeReroutingPlan = async () => {
    setConfirmDialogOpen(false);
    setLoading(true);
    setError('');
    setExecutingPlan(true);
    
    try {
      // In a real implementation, this would execute the plan in your backend system
      // For now, we'll just simulate execution with a timeout
      setTimeout(() => {
        setSuccess('Rerouting plan executed successfully');
        // Wait for 2 seconds to show success message before resetting
        setTimeout(() => {
          handleReset();
        }, 2000);
        setLoading(false);
        setExecutingPlan(false);
      }, 1500);
    } catch (err) {
      console.error('Error executing rerouting plan:', err);
      setError(err.response?.data?.error || 'Failed to execute rerouting plan');
      setLoading(false);
      setExecutingPlan(false);
    }
  };

  const isNextDisabled = () => {
    if (activeStep === 0) {
      return !affectedUnitType || !affectedUnitId || !disruptionType;
    } else if (activeStep === 1) {
      return false; // We just need the affected location details to continue
    } else if (activeStep === 2) {
      return !reroutingPlan;
    }
    return false;
  };

  // Render the Google Map with the rerouting plan visualization
  const renderMap = () => {
    if (!isMapLoaded || !reroutingPlan || !reroutingPlan.visualization_data) return null;
    
    return (
      <Box mt={3} p={2} sx={{ 
        border: `1px solid ${isDarkMode ? '#444' : '#eee'}`, 
        borderRadius: 1, 
        bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' 
      }}>
        <Typography variant="h6" gutterBottom color={isDarkMode ? 'primary.light' : 'primary.main'}>
          Rerouting Map Visualization
        </Typography>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: isDarkMode ? [
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
              { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
              { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
              { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
              { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
              { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
              { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
              { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
              { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
              { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
              { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
              { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
              { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
            ] : []
          }}
        >
          {/* Render markers for locations */}
          {reroutingPlan.visualization_data.map_markers.map((marker, idx) => (
            <Marker
              key={`marker-${idx}`}
              position={{ lat: marker.lat, lng: marker.lng }}
              label={marker.label}
              icon={{
                url: marker.type === 'affected' 
                  ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' 
                  : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}
          
          {/* Render routes between locations */}
          {reroutingPlan.visualization_data.routes.map((route, idx) => (
            <Polyline
              key={`route-${idx}`}
              path={[
                { lat: route.from.lat, lng: route.from.lng },
                { lat: route.to.lat, lng: route.to.lng }
              ]}
              options={{
                strokeColor: isDarkMode ? '#4caf50' : '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                geodesic: true,
              }}
            />
          ))}
        </GoogleMap>
      </Box>
    );
  };

  const renderEmptyState = () => {
      return (
      <Paper sx={{ 
        p: 4, 
        textAlign: 'center', 
        mt: 4, 
        bgcolor: isDarkMode ? 'background.paper' : 'white',
        boxShadow: isDarkMode ? '0px 3px 15px rgba(0,0,0,0.4)' : '0px 3px 15px rgba(0,0,0,0.1)'
      }}>
        <InfoOutlined sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom color={isDarkMode ? 'text.primary' : 'inherit'}>
          No Data Available
          </Typography>
        <Typography variant="body1" paragraph color={isDarkMode ? 'text.secondary' : 'inherit'}>
            Before using dynamic rerouting, you need to have products and locations configured.
          </Typography>
        <Typography variant="body2" paragraph color={isDarkMode ? 'text.secondary' : 'textSecondary'}>
          Please go to Settings {'>'}  Integration to import your inventory data.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
          onClick={() => navigate('/dashboard/settings')}
          >
          Go to Settings
          </Button>
      </Paper>
      );
  };

  const renderStep1 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ 
          p: 3, 
          bgcolor: isDarkMode ? 'background.paper' : 'white',
          boxShadow: isDarkMode ? '0px 3px 15px rgba(0,0,0,0.4)' : '0px 3px 15px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6" gutterBottom color="text.primary">
            Select Affected Supply Chain Unit
      </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="affected-unit-type-label">Affected Unit Type</InputLabel>
              <Select
                  labelId="affected-unit-type-label"
                  id="affected-unit-type"
                  value={affectedUnitType}
                  onChange={(e) => setAffectedUnitType(e.target.value)}
                  label="Affected Unit Type"
                  required
                  sx={{
                    color: 'text.primary',
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                      }
                    }
                  }}
                >
                  <MenuItem value="warehouse">Warehouse</MenuItem>
                  <MenuItem value="retailer">Retailer</MenuItem>
                  <MenuItem value="distribution_center">Distribution Center</MenuItem>
                  <MenuItem value="supplier">Supplier</MenuItem>
              </Select>
            </FormControl>
          </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="affected-unit-id-label">Affected Location</InputLabel>
              <Select
                  labelId="affected-unit-id-label"
                  id="affected-unit-id"
                  value={affectedUnitId}
                  onChange={(e) => setAffectedUnitId(e.target.value)}
                  label="Affected Location"
                  required
                  sx={{
                    color: 'text.primary',
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                      }
                    }
                  }}
                >
                  {availableLocations
                    .filter(loc => (!loc.type || loc.type === affectedUnitType) && loc.preferred)
                    .map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                        {location.name || `Location ${location.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="disruption-type-label">Disruption Type</InputLabel>
                <Select
                  labelId="disruption-type-label"
                  id="disruption-type"
                  value={disruptionType}
                  onChange={(e) => setDisruptionType(e.target.value)}
                  label="Disruption Type"
                  required
                  sx={{
                    color: 'text.primary',
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                      }
                    }
                  }}
                >
                  <MenuItem value="natural_disaster">Natural Disaster</MenuItem>
                  <MenuItem value="unavailability">Temporary Unavailability</MenuItem>
                  <MenuItem value="capacity_issue">Capacity Issue</MenuItem>
                  <MenuItem value="road_closure">Road Closure</MenuItem>
                  <MenuItem value="power_outage">Power Outage</MenuItem>
                  <MenuItem value="system_failure">System Failure</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
          </Grid>
        </Grid>
  );

  const renderStep2 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ 
          p: 3,
          bgcolor: isDarkMode ? 'background.paper' : 'white',
          boxShadow: isDarkMode ? '0px 3px 15px rgba(0,0,0,0.4)' : '0px 3px 15px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocalShipping color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" color="text.primary">Affected Location Details</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: isDarkMode ? 'background.default' : 'white' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="text.primary">
                    Location Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Name:</strong> {affectedLocation.name || `Location ${affectedUnitId}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Type:</strong> {affectedUnitType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Address:</strong> {affectedLocation.address || 'Address not available'}
      </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: isDarkMode ? 'background.default' : 'white' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color="text.primary">
                    Disruption Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Type:</strong> {disruptionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong> <Chip label="Pending Plan Generation" color="warning" size="small" />
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Impact Level:</strong> High
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            {generatingPlan ? (
              <Box>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
            Generating optimal rerouting plan...
          </Typography>
        </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Click "Next" to generate an AI-assisted rerouting plan
              </Typography>
      )}
          </Box>
    </Paper>
      </Grid>
    </Grid>
  );

  const renderStep3 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ 
          p: 3,
          bgcolor: isDarkMode ? 'background.paper' : 'white',
          boxShadow: isDarkMode ? '0px 3px 15px rgba(0,0,0,0.4)' : '0px 3px 15px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6" gutterBottom color={isDarkMode ? 'white' : 'rgba(0, 0, 0, 0.87)'}>
        Review Rerouting Plan
      </Typography>
      
      {reroutingPlan && (
        <>
              <Card sx={{ 
                mb: 3, 
                bgcolor: isDarkMode ? 'background.default' : 'white',
                boxShadow: isDarkMode ? '0px 3px 8px rgba(0,0,0,0.3)' : '0px 3px 8px rgba(0,0,0,0.1)'
              }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom color={isDarkMode ? 'text.primary' : 'inherit'}>
              Summary
            </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'inherit'}>
                        <strong>Affected Location:</strong> {reroutingPlan.summary.affected_location.name}
                      </Typography>
                      <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'inherit'}>
                        <strong>Disruption Type:</strong> {reroutingPlan.summary.disruption_type}
                      </Typography>
                      <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'inherit'}>
                        <strong>Total Affected Products:</strong> {reroutingPlan.summary.total_affected_products}
                </Typography>
              </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'inherit'}>
                        <strong>Total Affected Units:</strong> {reroutingPlan.summary.total_affected_units}
                      </Typography>
                      <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'inherit'}>
                        <strong>Rerouting Efficiency:</strong> {reroutingPlan.summary.rerouting_efficiency}%
                      </Typography>
                      {reroutingPlan.summary.rerouting_efficiency < 100 && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          <Typography variant="caption">
                            Some inventory cannot be optimally rerouted.
                </Typography>
                        </Alert>
                      )}
                      {reroutingPlan.summary.rerouting_efficiency === 100 && (
                        <Alert severity="success" sx={{ mt: 1 }}>
                          <Typography variant="caption">
                            Optimal rerouting solution found!
                          </Typography>
                        </Alert>
                      )}
              </Grid>
            </Grid>
                </CardContent>
              </Card>
              
              {/* Render the Google Map */}
              {renderMap()}
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }} color="text.primary">
                Rerouting Plan Details
          </Typography>
          
              <TableContainer component={Paper} sx={{ 
                mt: 2, 
                bgcolor: isDarkMode ? 'background.default' : 'white',
                '& .MuiTableCell-root': {
                  color: 'text.primary',
                  borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : undefined
                },
                '& .MuiTableHead-root': {
                  '& .MuiTableCell-root': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : undefined,
                    color: isDarkMode ? 'white' : 'inherit',
                    fontWeight: 'bold'
                  }
                },
                '& .MuiTableBody-root': {
                  '& .MuiTableRow-root': {
                    '&:nth-of-type(odd)': {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : undefined
                    },
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : undefined
                    }
                  }
                }
              }}>
                <Table size="small">
              <TableHead>
                <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Source</TableCell>
                  <TableCell>Destination</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Est. Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reroutingPlan.rerouting_plan.map((transfer, index) => (
                  <TableRow key={index}>
                        <TableCell>{transfer.product_name}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{transfer.source_location.name}</TableCell>
                        <TableCell>{transfer.destination_location.name}</TableCell>
                    <TableCell>
                          <Chip 
                            label={`P${transfer.priority}`} 
                            color={transfer.priority <= 2 ? "error" : transfer.priority <= 4 ? "warning" : "success"} 
                            size="small"
                          />
                    </TableCell>
                        <TableCell>{transfer.estimated_transport_time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }} color="text.primary">
                Additional Recommendations
              </Typography>
              
              <Grid container spacing={2}>
                {reroutingPlan.additional_recommendations.map((rec, index) => (
                  <Grid item xs={12} key={index}>
                    <Card sx={{ bgcolor: isDarkMode ? 'background.default' : 'white' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="text.primary">
                          {rec.recommendation}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Impact: {rec.impact}
                          </Typography>
                          <Chip 
                            label={rec.implementation_difficulty} 
                            size="small"
                            color={
                              rec.implementation_difficulty === 'Easy' ? 'success' :
                              rec.implementation_difficulty === 'Medium' ? 'warning' : 'error'
                            }
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          
          {executingPlan && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 3 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography color={isDarkMode ? 'text.secondary' : 'inherit'}>
                Executing rerouting plan and creating transfer orders...
              </Typography>
            </Box>
      )}
    </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SwapHoriz sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
        <Typography variant="h4" component="h1" color="text.primary">
        Dynamic Rerouting
      </Typography>
      </Box>
      
      <Paper sx={{ 
        p: 3, 
        mb: 3,
        bgcolor: isDarkMode ? 'background.paper' : 'white',
        boxShadow: isDarkMode ? '0px 3px 15px rgba(0,0,0,0.4)' : '0px 3px 15px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="body1" paragraph color="text.secondary">
          This tool helps you optimize inventory by rerouting products between locations to fulfill demand.
        </Typography>
        
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 3,
            '& .MuiStepLabel-label': {
              color: isDarkMode ? 'text.secondary' : 'text.secondary'
            },
            '& .MuiStepLabel-label.Mui-active': {
              color: isDarkMode ? 'text.primary' : 'text.primary'
            },
            '& .MuiStepLabel-label.Mui-completed': {
              color: isDarkMode ? 'primary.light' : 'primary.main'
            },
            // Ensure icons also get themed colors
            '& .MuiStepIcon-root': {
              color: isDarkMode ? 'grey.700' : 'grey.400' // Default icon color
            },
            '& .MuiStepIcon-root.Mui-active': {
              color: 'primary.main'
            },
            '& .MuiStepIcon-root.Mui-completed': {
              color: 'primary.main'
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {loading && <LinearProgress sx={{ mb: 3 }} />}
        
        {!isDataLoaded ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : availableLocations.length === 0 || availableProducts.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
        {activeStep === 0 && renderStep1()}
        {activeStep === 1 && renderStep2()}
        {activeStep === 2 && renderStep3()}
        
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row', 
              pt: 2,
              color: isDarkMode ? 'white' : 'rgba(0, 0, 0, 0.87)'
            }}>
            <Button
              color="inherit"
                disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ 
                mr: 1,
                color: isDarkMode ? 'white' : undefined, // Let inherit handle light mode
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : undefined // Use default border in light
              }}
            >
              Back
            </Button>
              <Box sx={{ flex: '1 1 auto' }} />
            {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleNext}
                disabled={isNextDisabled() || loading}
            >
                Next
            </Button>
            )}
          </Box>
          </>
        )}
      </Paper>
      
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? 'background.paper' : 'white'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" color="text.primary">
          Confirm Rerouting Plan
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" color="text.secondary">
            Are you sure you want to execute this rerouting plan?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="primary" /* Let theme handle color */>
            Cancel
          </Button>
          <Button onClick={executeReroutingPlan} color="primary" variant="contained" /* Let theme handle color */>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DynamicRerouting; 