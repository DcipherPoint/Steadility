import React, { useState, useEffect, useRef } from 'react';
import { 
  Container,
  Box, 
  Typography, 
  Button, 
  Grid, 
  TextField, 
  Paper,
  Slider,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Divider,
  alpha,
  IconButton,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormHelperText,
  useMediaQuery,
  InputAdornment,
  Alert,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  DirectionsCar, 
  Visibility,
  Map, 
  Timelapse,
  Eco,
  CompareArrows, 
  NaturePeople,
  LocalGasStation, 
  BarChart, 
  RouteOutlined,
  PaidOutlined,
  EmojiEvents,
  ArrowUpward,
  ArrowDownward,
  Lightbulb,
  Functions,
  ArrowBack,
  Close,
  InfoOutlined,
  ContentPaste,
  FormatListBulleted,
  FileUpload,
  LocationOn,
  ChevronRight
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../../contexts/AuthContext';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { darken } from 'polished';

// Map component to display routes and location markers
const MapComponent = ({ routes, destinations, startPoint, mapsLoaded, visibleRoute }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderers, setDirectionsRenderers] = useState({});
  const [mapError, setMapError] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Initialize map and services
  useEffect(() => {
    if (!mapsLoaded) return;

    const initializeMap = () => {
      try {
        // Ensure we have a valid LatLng object for the center
        let mapCenter;
        if (typeof startPoint === 'string') {
          // Default center if startPoint is a string (address) that needs geocoding
          mapCenter = { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore
        } else if (startPoint && startPoint.lat && startPoint.lng) {
          // Use startPoint if it's already a LatLng-like object
          mapCenter = startPoint;
        } else {
          // Fallback default
          mapCenter = { lat: 12.9716, lng: 77.5946 };
        }

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: 12,
        });

        // If startPoint is a string, geocode it for later use with markers
        if (typeof startPoint === 'string' && startPoint) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: startPoint }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              mapInstance.setCenter(results[0].geometry.location);
            }
          });
        }

        const directionsServiceInstance = new window.google.maps.DirectionsService();
        
        // Initialize separate renderers for each algorithm
        const renderers = {
          iafsa: new window.google.maps.DirectionsRenderer({
            map: mapInstance,
            polylineOptions: {
              strokeColor: '#4CAF50',
              strokeWeight: 4
            }
          }),
          ortools: new window.google.maps.DirectionsRenderer({
            map: mapInstance,
            polylineOptions: {
              strokeColor: '#2196F3',
              strokeWeight: 4
            }
          }),
          googlemaps: new window.google.maps.DirectionsRenderer({
            map: mapInstance,
            polylineOptions: {
              strokeColor: '#FFC107',
              strokeWeight: 4
            }
          })
        };

        setMap(mapInstance);
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderers(renderers);
        setMapError(null);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    };

    initializeMap();
  }, [mapsLoaded, startPoint]);

  // Handle route display
  useEffect(() => {
    if (!map || !directionsService || !directionsRenderers || !routes) return;

    try {
      // Clear all existing routes and markers
      Object.values(directionsRenderers).forEach(renderer => {
        renderer.setDirections({ routes: [] });
      });
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]); // Clear the marker state
      
      // Helper function to add a marker
      const addMarker = (position, label, title, color) => {
          const newMarker = new window.google.maps.Marker({
            position: position,
            map: map,
            label: label,
            title: title,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: label === 'D' ? 8 : 6, // Larger for Depot
              fillColor: color,
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            }
          });
          return newMarker;
      };

      // Add markers based on the first available route data
      const firstRouteKey = Object.keys(routes)[0];
      const firstRouteData = routes[firstRouteKey];
      const tempMarkers = [];

      // Add start point marker (geocoding if needed)
      const addStartMarker = (callback) => {
        if (!startPoint) return callback ? callback() : null;
        if (typeof startPoint === 'string') {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: startPoint }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              tempMarkers.push(addMarker(results[0].geometry.location, 'D', 'Depot', '#4CAF50'));
            }
            if (callback) callback();
          });
        } else if (startPoint.lat && startPoint.lng) {
          tempMarkers.push(addMarker(startPoint, 'D', 'Depot', '#4CAF50'));
          if (callback) callback();
        }
      };

      // Add destination markers (geocoding if needed)
      const addDestinationMarkers = (callback) => {
        let geocodeCount = destinations.length;
        if (geocodeCount === 0 && callback) return callback();
        destinations.forEach((dest, index) => {
          if (typeof dest === 'string') {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: dest }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                tempMarkers.push(addMarker(results[0].geometry.location, (index + 1).toString(), dest, '#2196F3'));
              }
              geocodeCount--;
              if (geocodeCount === 0 && callback) callback();
            });
          } else if (dest.lat && dest.lng) {
            tempMarkers.push(addMarker(dest, (index + 1).toString(), `Destination ${index + 1}`, '#2196F3'));
            geocodeCount--;
            if (geocodeCount === 0 && callback) callback();
          }
        });
      };

      // Chain marker additions: Start -> Destinations -> Set State
      addStartMarker(() => {
        addDestinationMarkers(() => {
          setMarkers(tempMarkers);
        });
      });

      // Determine which routes to show
      const routesToShow = visibleRoute ? [visibleRoute] : Object.keys(routes);

      // Display each route
      routesToShow.forEach(routeType => {
        const renderer = directionsRenderers[routeType];
        const routeData = routes[routeType];

        if (!renderer || !routeData) {
          console.warn(`No renderer or route data for ${routeType}`);
          return; 
        }
        
        // Option 1: Use direct directions if available
        if (routeData.directions) {
          console.log(`Setting direct API directions for ${routeType}`);
          renderer.setDirections(routeData.directions);
        } 
        // Option 2: Use the request object to get directions
        else if (routeData.request) {
          console.log(`Calculating directions for ${routeType} using request object:`, routeData.request);
          directionsService.route(routeData.request, (result, status) => {
            if (status === 'OK') {
              console.log(`Directions received for ${routeType}:`, result);
              renderer.setDirections(result);
            } else {
              console.error(`Directions request failed for ${routeType} with request:`, routeData.request, `Status: ${status}`);
            }
          });
        } 
        // No valid data to display this route
        else {
          console.warn(`No valid directions or request found for ${routeType}. Cannot display route.`);
        }
      });

      setMapError(null);
    } catch (error) {
      console.error('Error displaying routes:', error);
      setMapError('Failed to display routes');
    }
  }, [map, directionsService, directionsRenderers, routes, destinations, startPoint, visibleRoute]); // Removed mapKey dependency, markers handled separately

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [markers]);

  if (!mapsLoaded) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (mapError) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{mapError}</Typography>
      </Box>
    );
  }

  return (
    <Box ref={mapRef} sx={{ height: '100%', width: '100%' }} />
  );
};

// KPI Card Component
const KpiCard = ({ title, distance, cost, carbon, color, isPrimary, algorithm, onViewRoute, isRouteVisible, time }) => {
  const theme = useTheme();
  
  const formatTime = (seconds) => {
    if (seconds < 3600) {
      const minutes = Math.round(seconds / 60);
      return {
        value: minutes,
        unit: 'min',
        display: `${minutes} min`
      };
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      return {
        value: hours,
        unit: 'hr',
        display: minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hr`
      };
    }
  };
  
  const formattedTime = formatTime(time);
  
  return (
    <Box 
      sx={{ 
        position: 'relative',
        borderRadius: 2,
        border: `1px solid ${alpha(color, 0.2)}`,
        bgcolor: isPrimary ? alpha(color, 0.1) : 'background.paper',
        p: 2,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isPrimary ? `0 4px 12px ${alpha(color, 0.2)}` : 'none',
        mb: 3,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Time display */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          bgcolor: alpha(color, 0.9),
          color: '#fff',
          borderRadius: 1,
          px: 1.5,
          py: 0.75,
          boxShadow: `0 2px 4px ${alpha(color, 0.3)}`,
        }}
      >
        <Timelapse sx={{ mr: 0.75, fontSize: '1.1rem' }} />
        <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.95rem' }}>
          {formattedTime.display}
        </Typography>
      </Box>

      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography 
          variant="h6" 
          component="h3" 
            sx={{ 
            fontWeight: 600, 
            color: color,
            flex: 1
          }}
        >
          {title}
        </Typography>
      </Box>
      
      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={4}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            px: 1,
            py: 0.5 
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 0.5, fontSize: '0.8rem', textAlign: 'center' }}
            >
              Distance
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              color="text.primary" 
              sx={{ fontWeight: 600, textAlign: 'center' }}
            >
              {distance}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ textAlign: 'center' }}
            >
              km
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            px: 1,
            py: 0.5,
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 0.5, fontSize: '0.8rem', textAlign: 'center' }}
            >
              Cost
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              color="text.primary" 
              sx={{ fontWeight: 600, textAlign: 'center' }}
            >
              {cost}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ textAlign: 'center' }}
            >
              ₹
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            px: 1,
            py: 0.5 
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 0.5, fontSize: '0.8rem', textAlign: 'center' }}
            >
              Carbon
            </Typography>
            <Typography 
              variant="h6" 
              component="p"
              color="text.primary" 
              sx={{ fontWeight: 600, textAlign: 'center' }}
            >
              {carbon}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ textAlign: 'center' }}
            >
              kg
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      {/* Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant={isRouteVisible ? "contained" : "outlined"}
          color={isPrimary ? "primary" : "secondary"}
          onClick={() => onViewRoute(algorithm)}
          startIcon={<Visibility />}
          size="small"
          sx={{ 
            width: '100%',
            bgcolor: isRouteVisible ? color : 'transparent',
            borderColor: color,
            color: isRouteVisible ? '#fff' : color,
            '&:hover': {
              bgcolor: isRouteVisible ? darken(0.1, color) : alpha(color, 0.1),
              borderColor: color
            }
          }}
        >
          {isRouteVisible ? "HIDE ROUTE" : "VIEW ROUTE"}
        </Button>
      </Box>
    </Box>
  );
};

// Helper function to parse CSV file
const parseCSV = (csvText) => {
  const lines = csvText.split(/\r\n|\n|\r/).filter(line => line.trim());
  return lines.map(line => line.trim());
};

// Comparison metrics dialog component
const ComparisonMetricsDialog = ({ open, onClose, results, algorithms }) => {
  // Use hooks first to avoid any potential errors
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Function to calculate percentage difference
  const getPercentageChange = (baseline, comparison) => {
    if (!baseline || !comparison) return null;
    return ((baseline - comparison) / baseline * 100).toFixed(2);
  };
  
  // Create a dummy metricData structure if results are not available
  const metricData = results && results.iafsa ? {
    distance: {
      iafsa: results.iafsa.distance,
      ortools: results.ortools?.distance,
      googlemaps: results.googlemaps?.distance,
      improvement: {
        ortools: getPercentageChange(results.ortools?.distance, results.iafsa.distance),
        googlemaps: getPercentageChange(results.googlemaps?.distance, results.iafsa.distance)
      }
    },
    cost: {
      iafsa: results.iafsa.cost,
      ortools: results.ortools?.cost,
      googlemaps: results.googlemaps?.cost,
      improvement: {
        ortools: getPercentageChange(results.ortools?.cost, results.iafsa.cost),
        googlemaps: getPercentageChange(results.googlemaps?.cost, results.iafsa.cost)
      }
    },
    carbon: {
      iafsa: results.iafsa.carbon,
      ortools: results.ortools?.carbon,
      googlemaps: results.googlemaps?.carbon,
      improvement: {
        ortools: getPercentageChange(results.ortools?.carbon, results.iafsa.carbon),
        googlemaps: getPercentageChange(results.googlemaps?.carbon, results.iafsa.carbon)
      }
    }
  } : null;
  
  // Get the best algorithm for each metric
  const getBestForMetric = (metric) => {
    if (!metricData) return 'IAFSA';
    
    const values = [];
    
    if (metricData[metric].iafsa) values.push({ name: 'IAFSA', value: metricData[metric].iafsa });
    if (metricData[metric].ortools) values.push({ name: 'OR-Tools', value: metricData[metric].ortools });
    if (metricData[metric].googlemaps) values.push({ name: 'Google Maps', value: metricData[metric].googlemaps });
    
    return values.sort((a, b) => a.value - b.value)[0]?.name || 'IAFSA';
  };
  
  // Convert raw metrics to relative percentages for bar chart visualization
  const getRelativePercentage = (category, algorithm) => {
    if (!metricData || !metricData[category] || !metricData[category][algorithm]) return 0;
    
    const maxValue = Math.max(
      metricData[category].iafsa || 0,
      metricData[category].ortools || 0,
      metricData[category].googlemaps || 0
    );
    
    return (metricData[category][algorithm] / maxValue) * 100;
  };
  
  if (!results || !results.iafsa) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: isDarkMode ? alpha(theme.palette.primary.main, 0.8) : theme.palette.primary.main,
        color: theme.palette.common.white,
        py: 1.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BarChart sx={{ mr: 1 }} />
          Performance Metrics Comparison
        </Box>
        <IconButton onClick={onClose} aria-label="close" sx={{ color: 'inherit' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ py: 4, px: { xs: 2, md: 4 } }}>
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 2,
            mb: 4, 
            p: 2.5, 
            borderRadius: 2, 
            bgcolor: isDarkMode ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.05)',
            border: `1px solid ${theme.palette.primary.main}`,
            display: 'flex',
            alignItems: 'flex-start'
          }}
        >
          <InfoOutlined sx={{ fontSize: 22, mr: 1.5, mt: 0.2, color: theme.palette.primary.main }} />
          <Typography variant="body1" sx={{ color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary }}>
            This comparison shows how our IAFSA optimization algorithm performs relative to industry standard alternatives.
            <Box component="span" sx={{ fontWeight: 'medium', color: isDarkMode ? theme.palette.primary.light : theme.palette.primary.dark }}>
              {' '}Lower values are better for all metrics.
            </Box>
          </Typography>
        </Paper>
                
        {/* Distance metric comparison */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, borderLeft: `6px solid ${theme.palette.primary.main}` }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <RouteOutlined sx={{ mr: 1 }} />
            Distance Comparison
            {getBestForMetric('distance') === 'IAFSA' && (
              <Box
                component="span"
                sx={{
                  ml: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: theme.palette.success.main,
                  color: '#fff',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 4,
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <EmojiEvents fontSize="small" sx={{ mr: 0.5, fontSize: '0.95rem' }} />
                IAFSA
              </Box>
            )}
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3} lg={2}>
              <Typography variant="body2" fontWeight="medium">Algorithm</Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={7}>
              <Typography variant="body2" fontWeight="medium">Relative Performance</Typography>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body2" fontWeight="medium">Distance</Typography>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body2" fontWeight="medium">Difference</Typography>
            </Grid>
            
            {/* IAFSA */}
            <Grid item xs={12} md={3} lg={2}>
              <Typography variant="body1" sx={{ 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.success.main 
              }}>
                IAFSA
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={7}>
              <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, p: 0.5 }}>
                <Box sx={{ 
                  height: 24, 
                  width: `${getRelativePercentage('distance', 'iafsa')}%`, 
                  bgcolor: theme.palette.success.main,
                  borderRadius: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pl: 1,
                  pr: 1,
                  color: '#fff',
                  transition: 'width 1s ease-in-out'
                }}>
                  {getRelativePercentage('distance', 'iafsa') > 20 && (
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      IAFSA
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body1" fontWeight="medium">
                {metricData?.distance?.iafsa?.toFixed(2) || '--'} km
              </Typography>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.text.secondary }}>
                Baseline
              </Typography>
            </Grid>
            
            {/* OR-Tools if selected */}
            {algorithms.includes('ortools') && metricData?.distance?.ortools && (
              <>
                <Grid item xs={12} md={3} lg={2}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', color: '#2196F3' }}>
                    OR-Tools
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={7}>
                  <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, p: 0.5 }}>
                    <Box sx={{ 
                      height: 24, 
                      width: `${getRelativePercentage('distance', 'ortools')}%`, 
                      bgcolor: '#2196F3',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pl: 1,
                      pr: 1,
                      color: '#fff',
                      transition: 'width 1s ease-in-out'
                    }}>
                      {getRelativePercentage('distance', 'ortools') > 20 && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          OR-Tools
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  <Typography variant="body1">
                    {metricData?.distance?.ortools?.toFixed(2) || '--'} km
                  </Typography>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  {metricData?.distance?.improvement?.ortools && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ 
                        color: parseFloat(metricData.distance.improvement.ortools) > 0 ? 'error.main' : 'success.main',
                        fontWeight: 'medium'
                      }}>
                        {parseFloat(metricData.distance.improvement.ortools) > 0 ? '+' : ''}
                        {metricData.distance.improvement.ortools}%
                      </Typography>
                      {parseFloat(metricData.distance.improvement.ortools) > 0 && (
                        <Tooltip title="OR-Tools uses this much more distance than IAFSA">
                          <ArrowUpward fontSize="small" color="error" sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Grid>
              </>
            )}
            
            {/* Google Maps if selected */}
            {algorithms.includes('googlemaps') && metricData?.distance?.googlemaps && (
              <>
                <Grid item xs={12} md={3} lg={2}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', color: '#FF9800' }}>
                    Google Maps
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={7}>
                  <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, p: 0.5 }}>
                    <Box sx={{ 
                      height: 24, 
                      width: `${getRelativePercentage('distance', 'googlemaps')}%`, 
                      bgcolor: '#FF9800',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pl: 1,
                      pr: 1,
                      color: '#fff',
                      transition: 'width 1s ease-in-out'
                    }}>
                      {getRelativePercentage('distance', 'googlemaps') > 20 && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          Google Maps
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  <Typography variant="body1">
                    {metricData?.distance?.googlemaps?.toFixed(2) || '--'} km
                  </Typography>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  {metricData?.distance?.improvement?.googlemaps && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ 
                        color: parseFloat(metricData.distance.improvement.googlemaps) > 0 ? 'error.main' : 'success.main',
                        fontWeight: 'medium'
                      }}>
                        {parseFloat(metricData.distance.improvement.googlemaps) > 0 ? '+' : ''}
                        {metricData.distance.improvement.googlemaps}%
                      </Typography>
                      {parseFloat(metricData.distance.improvement.googlemaps) > 0 && (
                        <Tooltip title="Google Maps uses this much more distance than IAFSA">
                          <ArrowUpward fontSize="small" color="error" sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
        
        {/* Cost metric comparison */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, borderLeft: `6px solid ${theme.palette.secondary.main}` }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.secondary.main, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <PaidOutlined sx={{ mr: 1 }} />
            Cost Comparison
            {getBestForMetric('cost') === 'IAFSA' && (
              <Box
                component="span"
                sx={{
                  ml: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: theme.palette.success.main,
                  color: '#fff',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 4,
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <EmojiEvents fontSize="small" sx={{ mr: 0.5, fontSize: '0.95rem' }} />
                IAFSA
              </Box>
            )}
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3} lg={2}>
              <Typography variant="body2" fontWeight="medium">Algorithm</Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={7}>
              <Typography variant="body2" fontWeight="medium">Relative Performance</Typography>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body2" fontWeight="medium">Cost</Typography>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body2" fontWeight="medium">Difference</Typography>
            </Grid>
            
            {/* IAFSA */}
            <Grid item xs={12} md={3} lg={2}>
              <Typography variant="body1" sx={{ 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.success.main 
              }}>
                IAFSA
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={7}>
              <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, p: 0.5 }}>
                <Box sx={{ 
                  height: 24, 
                  width: `${getRelativePercentage('cost', 'iafsa')}%`, 
                  bgcolor: theme.palette.success.main,
                  borderRadius: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pl: 1,
                  pr: 1,
                  color: '#fff',
                  transition: 'width 1s ease-in-out'
                }}>
                  {getRelativePercentage('cost', 'iafsa') > 20 && (
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      IAFSA
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body1" fontWeight="medium">₹{metricData?.cost?.iafsa?.toFixed(2) || '--'}</Typography>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.text.secondary }}>
                Baseline
              </Typography>
            </Grid>
            
            {/* OR-Tools if selected */}
            {algorithms.includes('ortools') && metricData?.cost?.ortools && (
              <>
                <Grid item xs={12} md={3} lg={2}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', color: '#2196F3' }}>
                    OR-Tools
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={7}>
                  <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, p: 0.5 }}>
                    <Box sx={{ 
                      height: 24, 
                      width: `${getRelativePercentage('cost', 'ortools')}%`, 
                      bgcolor: '#2196F3',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pl: 1,
                      pr: 1,
                      color: '#fff',
                      transition: 'width 1s ease-in-out'
                    }}>
                      {getRelativePercentage('cost', 'ortools') > 20 && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          OR-Tools
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  <Typography variant="body1">₹{metricData?.cost?.ortools?.toFixed(2) || '--'}</Typography>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  {metricData?.cost?.improvement?.ortools && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ 
                        color: parseFloat(metricData.cost.improvement.ortools) > 0 ? 'error.main' : 'success.main',
                        fontWeight: 'medium'
                      }}>
                        {parseFloat(metricData.cost.improvement.ortools) > 0 ? '+' : ''}
                        {metricData.cost.improvement.ortools}%
                      </Typography>
                      {parseFloat(metricData.cost.improvement.ortools) > 0 && (
                        <Tooltip title="OR-Tools costs this much more than IAFSA">
                          <ArrowUpward fontSize="small" color="error" sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Grid>
              </>
            )}
            
            {/* Google Maps if selected */}
            {algorithms.includes('googlemaps') && metricData?.cost?.googlemaps && (
              <>
                <Grid item xs={12} md={3} lg={2}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', color: '#FF9800' }}>
                    Google Maps
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={7}>
                  <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, p: 0.5 }}>
                    <Box sx={{ 
                      height: 24, 
                      width: `${getRelativePercentage('cost', 'googlemaps')}%`, 
                      bgcolor: '#FF9800',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pl: 1,
                      pr: 1,
                      color: '#fff',
                      transition: 'width 1s ease-in-out'
                    }}>
                      {getRelativePercentage('cost', 'googlemaps') > 20 && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          Google Maps
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  <Typography variant="body1">₹{metricData?.cost?.googlemaps?.toFixed(2) || '--'}</Typography>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  {metricData?.cost?.improvement?.googlemaps && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ 
                        color: parseFloat(metricData.cost.improvement.googlemaps) > 0 ? 'error.main' : 'success.main',
                        fontWeight: 'medium'
                      }}>
                        {parseFloat(metricData.cost.improvement.googlemaps) > 0 ? '+' : ''}
                        {metricData.cost.improvement.googlemaps}%
                      </Typography>
                      {parseFloat(metricData.cost.improvement.googlemaps) > 0 && (
                        <Tooltip title="Google Maps costs this much more than IAFSA">
                          <ArrowUpward fontSize="small" color="error" sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
        
        {/* Carbon metric comparison */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2, borderLeft: `6px solid ${theme.palette.success.main}` }}>
          <Typography variant="h6" sx={{ mb: 3, color: theme.palette.success.main, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <NaturePeople sx={{ mr: 1 }} />
            Carbon Footprint Comparison
            {getBestForMetric('carbon') === 'IAFSA' && (
              <Box
                component="span"
                sx={{
                  ml: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: theme.palette.success.main,
                  color: '#fff',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 4,
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <EmojiEvents fontSize="small" sx={{ mr: 0.5, fontSize: '0.95rem' }} />
                IAFSA
              </Box>
            )}
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3} lg={2}>
              <Typography variant="body2" fontWeight="medium">Algorithm</Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={7}>
              <Typography variant="body2" fontWeight="medium">Relative Performance</Typography>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body2" fontWeight="medium">Carbon</Typography>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body2" fontWeight="medium">Difference</Typography>
            </Grid>
            
            {/* IAFSA */}
            <Grid item xs={12} md={3} lg={2}>
              <Typography variant="body1" sx={{ 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                color: theme.palette.success.main 
              }}>
                IAFSA
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} lg={7}>
              <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, p: 0.5 }}>
                <Box sx={{ 
                  height: 24, 
                  width: `${getRelativePercentage('carbon', 'iafsa')}%`, 
                  bgcolor: theme.palette.success.main,
                  borderRadius: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pl: 1,
                  pr: 1,
                  color: '#fff',
                  transition: 'width 1s ease-in-out'
                }}>
                  {getRelativePercentage('carbon', 'iafsa') > 20 && (
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      IAFSA
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body1" fontWeight="medium">{metricData?.carbon?.iafsa?.toFixed(2) || '--'} kg</Typography>
            </Grid>
            <Grid item xs={6} md={1.5} lg={1.5}>
              <Typography variant="body2" sx={{ fontWeight: 'medium', color: theme.palette.text.secondary }}>
                Baseline
              </Typography>
            </Grid>
            
            {/* OR-Tools if selected */}
            {algorithms.includes('ortools') && metricData?.carbon?.ortools && (
              <>
                <Grid item xs={12} md={3} lg={2}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', color: '#2196F3' }}>
                    OR-Tools
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={7}>
                  <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, p: 0.5 }}>
                    <Box sx={{ 
                      height: 24, 
                      width: `${getRelativePercentage('carbon', 'ortools')}%`, 
                      bgcolor: '#2196F3',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pl: 1,
                      pr: 1,
                      color: '#fff',
                      transition: 'width 1s ease-in-out'
                    }}>
                      {getRelativePercentage('carbon', 'ortools') > 20 && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          OR-Tools
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  <Typography variant="body1">{metricData?.carbon?.ortools?.toFixed(2) || '--'} kg</Typography>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  {metricData?.carbon?.improvement?.ortools && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ 
                        color: parseFloat(metricData.carbon.improvement.ortools) > 0 ? 'error.main' : 'success.main',
                        fontWeight: 'medium'
                      }}>
                        {parseFloat(metricData.carbon.improvement.ortools) > 0 ? '+' : ''}
                        {metricData.carbon.improvement.ortools}%
                      </Typography>
                      {parseFloat(metricData.carbon.improvement.ortools) > 0 && (
                        <Tooltip title="OR-Tools emits this much more carbon than IAFSA">
                          <ArrowUpward fontSize="small" color="error" sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Grid>
              </>
            )}
            
            {/* Google Maps if selected */}
            {algorithms.includes('googlemaps') && metricData?.carbon?.googlemaps && (
              <>
                <Grid item xs={12} md={3} lg={2}>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', color: '#FF9800' }}>
                    Google Maps
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} lg={7}>
                  <Box sx={{ width: '100%', bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 1, p: 0.5 }}>
                    <Box sx={{ 
                      height: 24, 
                      width: `${getRelativePercentage('carbon', 'googlemaps')}%`, 
                      bgcolor: '#FF9800',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pl: 1,
                      pr: 1,
                      color: '#fff',
                      transition: 'width 1s ease-in-out'
                    }}>
                      {getRelativePercentage('carbon', 'googlemaps') > 20 && (
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          Google Maps
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  <Typography variant="body1">{metricData?.carbon?.googlemaps?.toFixed(2) || '--'} kg</Typography>
                </Grid>
                <Grid item xs={6} md={1.5} lg={1.5}>
                  {metricData?.carbon?.improvement?.googlemaps && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ 
                        color: parseFloat(metricData.carbon.improvement.googlemaps) > 0 ? 'error.main' : 'success.main',
                        fontWeight: 'medium'
                      }}>
                        {parseFloat(metricData.carbon.improvement.googlemaps) > 0 ? '+' : ''}
                        {metricData.carbon.improvement.googlemaps}%
                      </Typography>
                      {parseFloat(metricData.carbon.improvement.googlemaps) > 0 && (
                        <Tooltip title="Google Maps emits this much more carbon than IAFSA">
                          <ArrowUpward fontSize="small" color="error" sx={{ ml: 0.5, fontSize: '0.9rem' }} />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
        
        {/* Average differences section inside the dialog */}
        {(algorithms.includes("ortools") || algorithms.includes("googlemaps")) && (
          <AverageDifferences 
            results={results}
            algorithms={algorithms}
          />
        )}
        
        <Box sx={{ 
          p: 3, 
          bgcolor: isDarkMode ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)', 
          borderRadius: 2,
          border: `1px solid ${theme.palette.success.main}`,
          mt: 4
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.success.main, mb: 1, display: 'flex', alignItems: 'center' }}>
            <Lightbulb sx={{ mr: 1 }} />
            Why IAFSA performs better:
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary }}>
            • IAFSA's advanced nature-inspired algorithm optimizes multiple priorities simultaneously.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary }}>
            • Unlike traditional algorithms that focus on a single metric, IAFSA balances time, cost, and environmental impact.
          </Typography>
          <Typography variant="body2" sx={{ color: isDarkMode ? theme.palette.text.primary : theme.palette.text.secondary }}>
            • The algorithm's intelligent fish behavior simulation allows it to escape local optima and find globally better solutions.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="primary"
          startIcon={<ArrowBack />}
          sx={{ borderRadius: 2 }}
        >
          Back to Results
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Define a new component for displaying average differences
const AverageDifferences = ({ results, algorithms }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Function to calculate percentage difference
  const getPercentageChange = (baseline, comparison) => {
    if (!baseline || !comparison) return null;
    // A positive value means the comparison value is HIGHER than the baseline
    // In our context, higher values are WORSE (more distance, more cost, more carbon)
    return ((comparison - baseline) / baseline * 100).toFixed(2);
  };
  
  // Calculate average differences for each algorithm
  const calculateAverageDifference = (algorithm) => {
    if (!results || !results.iafsa || !results[algorithm]) return null;
    
    const differences = [];
    
    // Get differences for distance
    const distanceDiff = getPercentageChange(results.iafsa.distance, results[algorithm].distance);
    if (distanceDiff !== null) differences.push(parseFloat(distanceDiff));
    
    // Get differences for cost
    const costDiff = getPercentageChange(results.iafsa.cost, results[algorithm].cost);
    if (costDiff !== null) differences.push(parseFloat(costDiff));
    
    // Get differences for carbon
    const carbonDiff = getPercentageChange(results.iafsa.carbon, results[algorithm].carbon);
    if (carbonDiff !== null) differences.push(parseFloat(carbonDiff));
    
    // Calculate average if we have any differences
    if (differences.length > 0) {
      const sum = differences.reduce((a, b) => a + b, 0);
      return (sum / differences.length).toFixed(2);
    }
    
    return null;
  };
  
  // Check which algorithm performs better
  const getBetterAlgorithm = (algorithm) => {
    if (!results || !results.iafsa || !results[algorithm]) return 'IAFSA';
    
    const avgDiff = calculateAverageDifference(algorithm);
    if (avgDiff === null) return 'IAFSA';
    
    // A positive percentage means the other algorithm performs worse
    // (since higher values for distance/cost/carbon are worse)
    return parseFloat(avgDiff) > 0 ? 'IAFSA' : algorithm;
  };
  
  // Only render if we have results to compare
  if (!results || !results.iafsa) return null;
  
  const algData = {};
  
  if (algorithms.includes("ortools") && results.ortools) {
    algData.ortools = {
      name: "OR-Tools",
      avg: calculateAverageDifference("ortools"),
      color: "#2196F3",
      icon: "analytics",
      isBetter: getBetterAlgorithm("ortools") === "ortools"
    };
  }
  
  if (algorithms.includes("googlemaps") && results.googlemaps) {
    algData.googlemaps = {
      name: "Google Maps",
      avg: calculateAverageDifference("googlemaps"),
      color: "#FF9800",
      icon: "map",
      isBetter: getBetterAlgorithm("googlemaps") === "googlemaps"
    };
  }
  
  // If we don't have any algorithms to compare, don't render
  if (Object.keys(algData).length === 0) return null;
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mt: 4, 
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        py: 1.5,
        px: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <CompareArrows sx={{ mr: 1.5 }} />
        <Typography variant="subtitle1" fontWeight="medium">Average Performance Differences</Typography>
      </Box>
      
      <Box sx={{ p: 2.5 }}>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          This shows the average difference across all metrics (distance, cost, and carbon) between each algorithm and IAFSA as the baseline.
          <Box component="span" sx={{ fontWeight: 'medium', color: theme.palette.primary.main }}>
            {' '}Positive values mean the algorithm performs worse than IAFSA. Negative values mean it performs better.
          </Box>
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(algData).map(([key, data]) => {
            const avgValue = parseFloat(data.avg);
            const isOtherAlgorithmWorse = avgValue > 0;
            
            return (
              <Paper
                key={key}
                elevation={1}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  borderLeft: `4px solid ${data.color}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '30%',
                    background: `linear-gradient(to right, transparent, ${
                      isOtherAlgorithmWorse 
                        ? `${alpha(theme.palette.success.main, isDarkMode ? 0.15 : 0.1)}` 
                        : `${alpha(theme.palette.error.main, isDarkMode ? 0.15 : 0.1)}`
                    })`,
                    opacity: 0.7,
                    zIndex: 0
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
                  <Avatar
                    sx={{ 
                      bgcolor: alpha(data.color, 0.1), 
                      color: data.color,
                      mr: 2,
                      width: 40,
                      height: 40
                    }}
                  >
                    {key === 'ortools' ? (
                      <Functions sx={{ fontSize: '1.2rem' }} />
                    ) : (
                      <Map sx={{ fontSize: '1.2rem' }} />
                    )}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium" sx={{ color: data.color }}>
                      {data.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      compared to IAFSA baseline
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: isOtherAlgorithmWorse 
                    ? alpha(theme.palette.success.main, isDarkMode ? 0.2 : 0.1)
                    : alpha(theme.palette.error.main, isDarkMode ? 0.2 : 0.1),
                  color: isOtherAlgorithmWorse ? theme.palette.success.dark : theme.palette.error.dark,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  zIndex: 1
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    mr: 1
                  }}>
                    {isOtherAlgorithmWorse ? '+' : ''}{data.avg}%
                  </Typography>
                  
                  {isOtherAlgorithmWorse ? (
                    <Tooltip title={`${data.name} is ${Math.abs(avgValue)}% worse than IAFSA`}>
                      <ArrowUpward sx={{ color: theme.palette.error.main }} />
                    </Tooltip>
                  ) : (
                    <Tooltip title={`${data.name} is ${Math.abs(avgValue)}% better than IAFSA`}>
                      <ArrowDownward sx={{ color: theme.palette.success.main }} />
                    </Tooltip>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};

export default function LastMileDelivery() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // State variables
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [sameAsStart, setSameAsStart] = useState(true);
  const [destinations, setDestinations] = useState('');
  const [results, setResults] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const [timeWeight, setTimeWeight] = useState(33);
  const [costWeight, setCostWeight] = useState(33);
  const [carbonWeight, setCarbonWeight] = useState(34);
  const [ecoMode, setEcoMode] = useState(false);
  const [fuelCost, setFuelCost] = useState(0.15);
  const [carbonCredits, setCarbonCredits] = useState(0);
  const [mapKey, setMapKey] = useState(Date.now());
  const [optimizationError, setOptimizationError] = useState(null);
  const [comparisonAlgorithms, setComparisonAlgorithms] = useState(['ortools', 'googlemaps']);
  const [visibleRoute, setVisibleRoute] = useState(null);
  const [openComparisonDialog, setOpenComparisonDialog] = useState(false);
  const fileInputRef = useRef(null);
  const [destinationsChanged, setDestinationsChanged] = useState(false);
  const destinationsTimer = useRef(null);
  
  // Comparison metrics popup
  const [metricsOpen, setMetricsOpen] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    setStartPoint(localStorage.getItem('lmd_startPoint') || '');
    setEndPoint(localStorage.getItem('lmd_endPoint') || '');
    setSameAsStart(localStorage.getItem('lmd_sameAsStart') === 'false' ? false : true);
    setDestinations(localStorage.getItem('lmd_destinations') || '');
    setTimeWeight(parseInt(localStorage.getItem('lmd_timeWeight') || '33', 10));
    setCostWeight(parseInt(localStorage.getItem('lmd_costWeight') || '33', 10));
    setCarbonWeight(parseInt(localStorage.getItem('lmd_carbonWeight') || '34', 10));
    setFuelCost(parseFloat(localStorage.getItem('lmd_fuelCost') || '0.15'));
    setEcoMode(localStorage.getItem('lmd_ecoMode') === 'true');
    
    try {
      const savedAlgorithms = localStorage.getItem('lmd_comparisonAlgorithms');
      if (savedAlgorithms) {
        setComparisonAlgorithms(JSON.parse(savedAlgorithms));
      }
    } catch (e) {
      console.error("Error parsing saved comparison algorithms:", e);
    }
  }, []);

  // Input states with localStorage persistence
  useEffect(() => {
    setStartPoint(localStorage.getItem('lmd_startPoint') || '');
  }, []);
  
  useEffect(() => {
    setEndPoint(localStorage.getItem('lmd_endPoint') || '');
  }, []);
  
  useEffect(() => {
    setSameAsStart(localStorage.getItem('lmd_sameAsStart') === 'false' ? false : true);
  }, []);
  
  useEffect(() => {
    setDestinations(localStorage.getItem('lmd_destinations') || '');
  }, []);
  
  useEffect(() => {
    setTimeWeight(parseInt(localStorage.getItem('lmd_timeWeight') || '33', 10));
  }, []);
  
  useEffect(() => {
    setCostWeight(parseInt(localStorage.getItem('lmd_costWeight') || '33', 10));
  }, []);
  
  useEffect(() => {
    setCarbonWeight(parseInt(localStorage.getItem('lmd_carbonWeight') || '34', 10));
  }, []);
  
  useEffect(() => {
    setFuelCost(parseFloat(localStorage.getItem('lmd_fuelCost') || '0.15'));
  }, []);
  
  useEffect(() => {
    setEcoMode(localStorage.getItem('lmd_ecoMode') === 'true');
  }, []);
  
  useEffect(() => {
    setComparisonAlgorithms(JSON.parse(localStorage.getItem('lmd_comparisonAlgorithms') || '["ortools", "googlemaps"]'));
  }, []);
  
  // Handle same as start toggle
  const handleSameAsStartToggle = () => {
    setSameAsStart(!sameAsStart);
    if (!sameAsStart) {
      setEndPoint(startPoint);
    } else {
      setEndPoint('');
    }
  };

  // Update end point when start point changes if sameAsStart is true
  useEffect(() => {
    if (sameAsStart && startPoint) {
      setEndPoint(startPoint);
    }
  }, [startPoint, sameAsStart]);

  // Convert destinations string to array for map markers
  const destinationsArray = destinations.split('\n').map(d => d.trim()).filter(d => d);
  
  // Delayed reload of the map when destinations are changed
  useEffect(() => {
    // Only update map if destinations changed and routes exist
    if (destinationsChanged && routes) {
      // Clear any existing timer
      if (destinationsTimer.current) {
        clearTimeout(destinationsTimer.current);
      }
      
      // Set new timer to update map after 500ms
      destinationsTimer.current = setTimeout(() => {
        setMapKey(Date.now()); // Force map re-render
        setDestinationsChanged(false);
      }, 500);
    }
    
    return () => {
      if (destinationsTimer.current) {
        clearTimeout(destinationsTimer.current);
      }
    };
  }, [destinationsChanged, routes]);

  // Handle destinations change
  const handleDestinationsChange = (e) => {
    setDestinations(e.target.value);
    if (routes) {
      setDestinationsChanged(true);
    }
  };
  
  // Handle destinations blur
  const handleDestinationsBlur = () => {
    if (destinationsChanged) {
      // Force map re-render when user leaves the field
      if (routes) {
        setMapKey(Date.now());
      }
      setDestinationsChanged(false);
    }
  };

  // Initialize Google Maps - safer implementation
  useEffect(() => {
    // Skip if already loaded or no API key available
    if (mapsLoaded || mapsError) return;
    
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Use environment variable directly
    
    if (!apiKey) {
      console.error("Google Maps API Key is missing. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your environment.");
      setMapsError("Google Maps API Key is missing.");
      return;
    }
    
    // Function to handle API loaded successfully
    const handleApiLoaded = () => {
      setMapsLoaded(true);
      console.log('Google Maps API loaded successfully');
    };

    // Function to handle API loading error
    const handleApiError = () => {
      setMapsError('Failed to load Google Maps API');
      console.error('Failed to load Google Maps API');
    };

    // Create script element to load the API
    try {
      // Remove any existing Google Maps scripts to avoid conflicts
      const existingScript = document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script';
      script.onload = handleApiLoaded;
      script.onerror = handleApiError;
      
      document.head.appendChild(script);
    } catch (error) {
      setMapsError(`Error setting up Google Maps: ${error.message}`);
      console.error("Error setting up Google Maps:", error);
    }

    // Clean up function
    return () => {
      // Remove the script if component unmounts before loading completes
      const script = document.getElementById('google-maps-script');
      if (script && !mapsLoaded) {
        document.head.removeChild(script);
      }
    };
  }, [mapsLoaded, mapsError]);

  // Handle slider updates with improved extreme value handling and magnetic snap
  const handleSliderChange = (type, value) => {
    if (ecoMode) return; // No changes when eco mode is active
    
    // Implement "pulling" effect to snap to nearest mark if within 3 units
    const nearestMark = Math.round(value / 10) * 10;
    const distanceToMark = Math.abs(value - nearestMark);
    
    // If within 3 units of a 10% mark, pull to that mark
    // Pull strength increases as we get closer to the mark
    let roundedValue = value;
    if (distanceToMark < 3) {
      // Apply stronger pull as we get closer to the mark
      const pullStrength = (3 - distanceToMark) / 3; // 0 to 1 scale
      roundedValue = value + ((nearestMark - value) * pullStrength);
    }
    
    // Ensure the value is within 0-100% range
    roundedValue = Math.max(0, Math.min(100, roundedValue));
    
    // Round to nearest whole number for cleaner display
    roundedValue = Math.round(roundedValue);
    
    // Update the specified weight
    let newTimeWeight = timeWeight;
    let newCostWeight = costWeight;
    let newCarbonWeight = carbonWeight;
    
    if (type === 'time') {
      newTimeWeight = roundedValue;
    } else if (type === 'cost') {
      newCostWeight = roundedValue;
    } else if (type === 'carbon') {
      newCarbonWeight = roundedValue;
    }
    
    // Normalize weights to sum to 100
    const total = newTimeWeight + newCostWeight + newCarbonWeight;
    
    if (total > 0) {
      // Adjust the remaining weights proportionally
      if (type === 'time') {
        const remainingWeight = 100 - newTimeWeight;
        // Distribute remaining weight between cost and carbon proportionally
        if (newCostWeight + newCarbonWeight > 0) {
          const costRatio = newCostWeight / (newCostWeight + newCarbonWeight);
          newCostWeight = Math.round(remainingWeight * costRatio);
          newCarbonWeight = Math.round(remainingWeight * (1 - costRatio));
          
          // Fix rounding errors
          if (newTimeWeight + newCostWeight + newCarbonWeight !== 100) {
            // Adjust the smaller of cost and carbon
            if (newCostWeight <= newCarbonWeight) {
              newCostWeight = Math.max(0, 100 - newTimeWeight - newCarbonWeight);
            } else {
              newCarbonWeight = Math.max(0, 100 - newTimeWeight - newCostWeight);
            }
          }
        } else {
          // If both cost and carbon were 0, distribute equally
          newCostWeight = Math.round(remainingWeight / 2);
          newCarbonWeight = remainingWeight - newCostWeight;
        }
      } else if (type === 'cost') {
        const remainingWeight = 100 - newCostWeight;
        if (newTimeWeight + newCarbonWeight > 0) {
          const timeRatio = newTimeWeight / (newTimeWeight + newCarbonWeight);
          newTimeWeight = Math.round(remainingWeight * timeRatio);
          newCarbonWeight = Math.round(remainingWeight * (1 - timeRatio));
          
          // Fix rounding errors
          if (newTimeWeight + newCostWeight + newCarbonWeight !== 100) {
            if (newTimeWeight <= newCarbonWeight) {
              newTimeWeight = Math.max(0, 100 - newCostWeight - newCarbonWeight);
            } else {
              newCarbonWeight = Math.max(0, 100 - newTimeWeight - newCostWeight);
            }
          }
        } else {
          newTimeWeight = Math.round(remainingWeight / 2);
          newCarbonWeight = remainingWeight - newTimeWeight;
        }
      } else if (type === 'carbon') {
        const remainingWeight = 100 - newCarbonWeight;
        if (newTimeWeight + newCostWeight > 0) {
          const timeRatio = newTimeWeight / (newTimeWeight + newCostWeight);
          newTimeWeight = Math.round(remainingWeight * timeRatio);
          newCostWeight = Math.round(remainingWeight * (1 - timeRatio));
          
          // Fix rounding errors
          if (newTimeWeight + newCostWeight + newCarbonWeight !== 100) {
            if (newTimeWeight <= newCostWeight) {
              newTimeWeight = Math.max(0, 100 - newCostWeight - newCarbonWeight);
            } else {
              newCostWeight = Math.max(0, 100 - newTimeWeight - newCarbonWeight);
            }
          }
        } else {
          newTimeWeight = Math.round(remainingWeight / 2);
          newCostWeight = remainingWeight - newTimeWeight;
        }
      }
    }
    
    // Ensure no negative values after rounding errors
    newTimeWeight = Math.max(0, newTimeWeight);
    newCostWeight = Math.max(0, newCostWeight);
    newCarbonWeight = Math.max(0, newCarbonWeight);
    
    // Final sum check - adjust the non-active slider if needed
    const finalSum = newTimeWeight + newCostWeight + newCarbonWeight;
    if (finalSum !== 100) {
      if (type === 'time') {
        newCostWeight = Math.max(0, 100 - newTimeWeight - newCarbonWeight);
      } else if (type === 'cost') {
        newCarbonWeight = Math.max(0, 100 - newTimeWeight - newCostWeight);
      } else if (type === 'carbon') {
        newTimeWeight = Math.max(0, 100 - newCostWeight - newCarbonWeight);
      }
    }
    
    // Log the updated weights for debugging
    console.log(`Updated weights: Time=${newTimeWeight}%, Cost=${newCostWeight}%, Carbon=${newCarbonWeight}%`);
    
    // Update state
    setTimeWeight(newTimeWeight);
    setCostWeight(newCostWeight);
    setCarbonWeight(newCarbonWeight);
  };

  // Handle eco mode toggle with locked values
  const handleEcoModeChange = (event) => {
    setEcoMode(event.target.checked);
    if (event.target.checked) {
      // Lock to specified eco priorities: 5/5/90
      setTimeWeight(5);
      setCostWeight(5);
      setCarbonWeight(90);
    } else {
      // Reset to balanced priorities
      setTimeWeight(30);
      setCostWeight(30);
      setCarbonWeight(40);
    }
  };

  // Load sample data with Bengaluru locations
  const loadSampleData = () => {
    setStartPoint('Bengaluru, Karnataka, India');
    setDestinations(`Indiranagar, Bengaluru, Karnataka, India
Koramangala, Bengaluru, Karnataka, India
MG Road, Bengaluru, Karnataka, India
Whitefield, Bengaluru, Karnataka, India
Electronic City, Bengaluru, Karnataka, India`);
  };

  // Fetch data from clipboard
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setDestinations(text);
    } catch (error) {
      alert('Failed to read from clipboard. Make sure your browser allows clipboard access.');
    }
  };

  // Handle CSV file import
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const locations = parseCSV(content);
        
        if (locations.length === 0) {
          alert('No valid locations found in the CSV file.');
          return;
        }
        
        // If the file contains at least one location, set it as destinations
        setDestinations(locations.join('\n'));
      } catch (err) {
        console.error('Error parsing CSV file:', err);
        alert('Failed to parse the CSV file. Please check the file format.');
      }
    };
    
    reader.onerror = () => {
      alert('Failed to read the file. Please try again.');
    };
    
    reader.readAsText(file);
    
    // Reset the file input so the same file can be selected again
    event.target.value = '';
  };

  // Trigger file input click
  const handleImportCSV = () => {
    fileInputRef.current.click();
  };

  // IAFSA implementation - based on the 3rd MVP References
  const runIAFSA = (destinations, timeWeight, costWeight, carbonWeight, fuelCost) => {
    // This is a simplified version for frontend demonstration
    // The actual implementation runs on the backend
    
    class Fish {
      constructor(route, distances, costs, emissions) {
        this.route = [...route]; // Deep copy the route
        this.fitness = this.calculateFitness(distances, costs, emissions);
      }
      
      calculateFitness(distances, costs, emissions) {
        // Calculate weighted fitness based on user priorities
        
        // Handle extreme cases specially
        if (timeWeight === 100) {
          return distances.reduce((sum, d) => sum + d, 0);
        } else if (costWeight === 100) {
          return costs.reduce((sum, c) => sum + c, 0);
        } else if (carbonWeight === 100) {
          return emissions.reduce((sum, e) => sum + e, 0);
        }
        
        // Normal case - weighted combination
        const timeScore = distances.reduce((sum, d) => sum + d, 0) * (timeWeight / 100);
        const costScore = costs.reduce((sum, c) => sum + c, 0) * (costWeight / 100);
        const carbonScore = emissions.reduce((sum, e) => sum + e, 0) * (carbonWeight / 100);
        return timeScore + costScore + carbonScore;
      }
      
      perturb(distances, costs, emissions) {
        // Try to improve the route by swapping destinations
        if (this.route.length <= 2) return;
        
        const newRoute = [...this.route];
        const idx1 = 1 + Math.floor(Math.random() * (newRoute.length - 1));
        let idx2 = 1 + Math.floor(Math.random() * (newRoute.length - 1));
        while (idx1 === idx2) {
          idx2 = 1 + Math.floor(Math.random() * (newRoute.length - 1));
        }
        
        // Swap positions
        [newRoute[idx1], newRoute[idx2]] = [newRoute[idx2], newRoute[idx1]];
        
        // Calculate new fitness
        const newFish = new Fish(newRoute, distances, costs, emissions);
        
        // If better, update this fish
        if (newFish.fitness < this.fitness) {
          this.route = newFish.route;
          this.fitness = newFish.fitness;
        }
      }
    }
    
    // Simulated route data (in a real app, this would come from Google Maps API)
    const numLocations = destinations.length + 1; // +1 for starting point
    const distanceMatrix = Array(numLocations).fill().map(() => Array(numLocations).fill(0));
    const costMatrix = Array(numLocations).fill().map(() => Array(numLocations).fill(0));
    const emissionMatrix = Array(numLocations).fill().map(() => Array(numLocations).fill(0));
    
    // Fill matrices with random but realistic values
    for (let i = 0; i < numLocations; i++) {
      for (let j = 0; j < numLocations; j++) {
        if (i !== j) {
          // Distance in km (Bengaluru-scale)
          distanceMatrix[i][j] = 5 + Math.random() * 20;
          // Cost based on distance and fuel cost
          costMatrix[i][j] = distanceMatrix[i][j] * fuelCost;
          // Emissions based on distance (typical car emissions kg CO2/km)
          emissionMatrix[i][j] = distanceMatrix[i][j] * 0.12;
        }
      }
    }
    
    // Initialize population of fish (different route permutations)
    const initialRoute = [0]; // Start with the start point
    for (let i = 1; i < numLocations; i++) {
      initialRoute.push(i);
    }
    
    // Increase fish population and iterations for extreme weights to find better solutions
    const numFish = carbonWeight === 100 || timeWeight === 100 || costWeight === 100 ? 40 : 20;
    const maxIterations = carbonWeight === 100 || timeWeight === 100 || costWeight === 100 ? 100 : 50;
    let fishSchool = [];
    
    // Create initial fish with random routes
    for (let i = 0; i < numFish; i++) {
      // Create a shuffled route (keeping start point at index 0)
      const shuffledRoute = [0];
      const destinationIndices = Array.from({length: numLocations - 1}, (_, i) => i + 1);
      
      // Fisher-Yates shuffle
      for (let j = destinationIndices.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [destinationIndices[j], destinationIndices[k]] = [destinationIndices[k], destinationIndices[j]];
      }
      
      shuffledRoute.push(...destinationIndices);
      
      // Calculate distances, costs, and emissions for this route
      const routeDistances = [];
      const routeCosts = [];
      const routeEmissions = [];
      
      for (let j = 0; j < shuffledRoute.length - 1; j++) {
        const from = shuffledRoute[j];
        const to = shuffledRoute[j + 1];
        routeDistances.push(distanceMatrix[from][to]);
        routeCosts.push(costMatrix[from][to]);
        routeEmissions.push(emissionMatrix[from][to]);
      }
      
      // Add return to start
      const lastIdx = shuffledRoute[shuffledRoute.length - 1];
      const startIdx = shuffledRoute[0];
      routeDistances.push(distanceMatrix[lastIdx][startIdx]);
      routeCosts.push(costMatrix[lastIdx][startIdx]);
      routeEmissions.push(emissionMatrix[lastIdx][startIdx]);
      
      fishSchool.push(new Fish(shuffledRoute, routeDistances, routeCosts, routeEmissions));
    }
    
    // Run IAFSA for a set number of iterations
    for (let iter = 0; iter < maxIterations; iter++) {
      // For each fish in the school
      for (let i = 0; i < fishSchool.length; i++) {
        // Determine behavior (prey, swarm, or follow)
        // Adjust behavior probabilities for extreme priority weights
        let preyProbability = 0.5;
        let swarmProbability = 0.25;
        
        if (carbonWeight === 100 || timeWeight === 100 || costWeight === 100) {
          // For extreme weights, focus more on individual improvement (prey behavior)
          preyProbability = 0.7;
          swarmProbability = 0.2;
        }
        
        const behavior = Math.random();
        
        if (behavior < preyProbability) {
          // Prey behavior - try to improve current route
          const distances = [];
          const costs = [];
          const emissions = [];
          
          for (let j = 0; j < fishSchool[i].route.length - 1; j++) {
            const from = fishSchool[i].route[j];
            const to = fishSchool[i].route[j + 1];
            distances.push(distanceMatrix[from][to]);
            costs.push(costMatrix[from][to]);
            emissions.push(emissionMatrix[from][to]);
          }
          
          // Add return to start
          const lastIdx = fishSchool[i].route[fishSchool[i].route.length - 1];
          const startIdx = fishSchool[i].route[0];
          distances.push(distanceMatrix[lastIdx][startIdx]);
          costs.push(costMatrix[lastIdx][startIdx]);
          emissions.push(emissionMatrix[lastIdx][startIdx]);
          
          fishSchool[i].perturb(distances, costs, emissions);
        } else if (behavior < (preyProbability + swarmProbability)) {
          // Swarm behavior - move toward center of nearby fish
          // Find the center (average) route of all fish
          const centerRoute = Array(numLocations).fill(0);
          for (let j = 0; j < fishSchool.length; j++) {
            for (let k = 0; k < fishSchool[j].route.length; k++) {
              centerRoute[k] += fishSchool[j].route[k];
            }
          }
          for (let k = 0; k < centerRoute.length; k++) {
            centerRoute[k] = Math.round(centerRoute[k] / fishSchool.length);
          }
          
          // Try to adopt some of the center route's properties
          if (Math.random() < 0.3) {
            const newRoute = [...fishSchool[i].route];
            const swapPoint = 1 + Math.floor(Math.random() * (newRoute.length - 1));
            
            // Find the position of centerRoute[swapPoint] in newRoute
            const posInNew = newRoute.indexOf(centerRoute[swapPoint]);
            
            // Swap if found and not in the same position
            if (posInNew !== -1 && posInNew !== swapPoint) {
              [newRoute[swapPoint], newRoute[posInNew]] = [newRoute[posInNew], newRoute[swapPoint]];
              
              // Calculate distances, costs, and emissions for this route
              const distances = [];
              const costs = [];
              const emissions = [];
              
              for (let j = 0; j < newRoute.length - 1; j++) {
                const from = newRoute[j];
                const to = newRoute[j + 1];
                distances.push(distanceMatrix[from][to]);
                costs.push(costMatrix[from][to]);
                emissions.push(emissionMatrix[from][to]);
              }
              
              // Add return to start
              const lastIdx = newRoute[newRoute.length - 1];
              const startIdx = newRoute[0];
              distances.push(distanceMatrix[lastIdx][startIdx]);
              costs.push(costMatrix[lastIdx][startIdx]);
              emissions.push(emissionMatrix[lastIdx][startIdx]);
              
              const newFish = new Fish(newRoute, distances, costs, emissions);
              
              // If better, update this fish
              if (newFish.fitness < fishSchool[i].fitness) {
                fishSchool[i] = newFish;
              }
            }
          }
        } else {
          // Follow behavior - follow the best fish
          const bestFish = fishSchool.reduce((best, current) => 
            current.fitness < best.fitness ? current : best, fishSchool[0]);
          
          if (bestFish !== fishSchool[i]) {
            // Try to adopt some of the best fish's route properties
            if (Math.random() < 0.4) {
              const newRoute = [...fishSchool[i].route];
              const swapPoint = 1 + Math.floor(Math.random() * (newRoute.length - 1));
              
              // Find the position of bestFish.route[swapPoint] in newRoute
              const posInNew = newRoute.indexOf(bestFish.route[swapPoint]);
              
              // Swap if found and not in the same position
              if (posInNew !== -1 && posInNew !== swapPoint) {
                [newRoute[swapPoint], newRoute[posInNew]] = [newRoute[posInNew], newRoute[swapPoint]];
                
                // Calculate distances, costs, and emissions for this route
                const distances = [];
                const costs = [];
                const emissions = [];
                
                for (let j = 0; j < newRoute.length - 1; j++) {
                  const from = newRoute[j];
                  const to = newRoute[j + 1];
                  distances.push(distanceMatrix[from][to]);
                  costs.push(costMatrix[from][to]);
                  emissions.push(emissionMatrix[from][to]);
                }
                
                // Add return to start
                const lastIdx = newRoute[newRoute.length - 1];
                const startIdx = newRoute[0];
                distances.push(distanceMatrix[lastIdx][startIdx]);
                costs.push(costMatrix[lastIdx][startIdx]);
                emissions.push(emissionMatrix[lastIdx][startIdx]);
                
                const newFish = new Fish(newRoute, distances, costs, emissions);
                
                // If better, update this fish
                if (newFish.fitness < fishSchool[i].fitness) {
                  fishSchool[i] = newFish;
                }
              }
            }
          }
        }
      }
    }
    
    // Find the best fish (optimal route)
    const bestFish = fishSchool.reduce((best, current) => 
      current.fitness < best.fitness ? current : best, fishSchool[0]);
    
    // Calculate total distance, cost, and emissions for best route
    let totalDistance = 0;
    let totalCost = 0;
    let totalEmissions = 0;
    
    for (let i = 0; i < bestFish.route.length - 1; i++) {
      const from = bestFish.route[i];
      const to = bestFish.route[i + 1];
      totalDistance += distanceMatrix[from][to];
      totalCost += costMatrix[from][to];
      totalEmissions += emissionMatrix[from][to];
    }
    
    // Add return to start
    const lastIdx = bestFish.route[bestFish.route.length - 1];
    const startIdx = bestFish.route[0];
    totalDistance += distanceMatrix[lastIdx][startIdx];
    totalCost += costMatrix[lastIdx][startIdx];
    totalEmissions += emissionMatrix[lastIdx][startIdx];
    
    // Convert indices to actual locations
    const optimalRoute = bestFish.route.map(idx => {
      if (idx === 0) return startPoint;
      return destinations[idx - 1]; // -1 because index 0 is the start point
    });
    
    return {
      route: optimalRoute,
      distance: totalDistance,
      cost: totalCost,
      emissions: totalEmissions
    };
  };

  // Handle comparison algorithm change for multiple selection
  const handleComparisonChange = (event) => {
    const selected = event.target.value;
    // Ensure it's an array even if a single value is returned
    let selectedAlgorithms = Array.isArray(selected) ? selected : [selected];
    
    console.log("Selected comparison algorithms:", selectedAlgorithms);
    
    // Force routes update when changing algorithms
    if (routes && 
        ((selectedAlgorithms.includes("googlemaps") && !comparisonAlgorithms.includes("googlemaps")) || 
         (!selectedAlgorithms.includes("googlemaps") && comparisonAlgorithms.includes("googlemaps")))) {
      // If Google Maps was added or removed, force rerender of routes
      setMapKey(Date.now());
    }
    
    setComparisonAlgorithms(selectedAlgorithms);
  };

  // Submit form to optimize route
  const handleOptimize = async () => {
    if (!startPoint) {
      alert('Please enter a start point');
      return;
    }

    if (!destinations) {
      alert('Please enter destinations');
      return;
    }

    try {
      setLoading(true);
      setOptimizationError(null);
      setResults(null);
      setCarbonCredits(0);
      
      // Process destinations
      const destinationsList = destinations.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
        
      if (destinationsList.length === 0) {
        alert('Please enter at least one destination');
        setLoading(false);
        return;
      }
      
      console.log("Sending optimization request with destinations:", destinationsList);
      
      // Use the actual end point or fall back to start point if sameAsStart is true
      const actualEndPoint = sameAsStart ? startPoint : endPoint;
      
      // Use the comparison algorithms selected by the user
      const comparison = comparisonAlgorithms;
      
      // Log the weights being sent to the API for debugging purposes
      console.log("Sending optimization weights to API:", {
        time: timeWeight,
        cost: costWeight,
        carbon: carbonWeight
      });
      
      const response = await axios.post('/api/last-mile-delivery/optimize', {
        startPoint: startPoint || 'Bengaluru, Karnataka, India',
        endPoint: actualEndPoint || startPoint || 'Bengaluru, Karnataka, India',
        destinations: destinationsList,
        weights: {
          time: timeWeight,
          cost: costWeight,
          carbon: carbonWeight
        },
        fuelCostPerKm: fuelCost,
        comparison: comparison
      });

      console.log("Received API response:", response.data);

      // Create a copy of the response data to modify safely
      const processedResults = { ...response.data };

      // Store results data for KPI display
      if (processedResults && typeof processedResults === 'object') {
        // Ensure we have at least the IAFSA result data
        if (!processedResults.iafsa) {
          console.warn("No IAFSA result from API, falling back to local calculation");
          // Calculate IAFSA results locally if not provided by API
          const iafsaResult = runIAFSA(
            destinationsList,
            timeWeight,
            costWeight,
            carbonWeight,
            fuelCost
          );
          
          processedResults.iafsa = {
            distance: iafsaResult.distance,
            cost: iafsaResult.cost,
            carbon: iafsaResult.emissions,
            // Add directions structure for map
            directions: {
              routes: [
                {
                  legs: iafsaResult.route.map((loc, idx) => {
                    if (idx === iafsaResult.route.length - 1) return null;
                    return {
                      start_address: loc,
                      end_address: iafsaResult.route[idx + 1],
                      steps: [{
                        travel_mode: "DRIVING",
                        instructions: `Drive from ${loc} to ${iafsaResult.route[idx + 1]}`
                      }]
                    };
                  }).filter(Boolean)
                }
              ],
              status: "OK",
              request: { travelMode: "DRIVING" }
            }
          };
        }

        // Update the results state with the processed data
        console.log("Setting results state with:", processedResults);
        setResults(processedResults);
        
        // Calculate carbon credits based on savings
        if (processedResults.iafsa && (processedResults.ortools || processedResults.googlemaps)) {
          const comparisonData = processedResults.ortools || processedResults.googlemaps;
          const savings = comparisonData.carbon - processedResults.iafsa.carbon;
          setCarbonCredits(Math.max(0, savings * 0.5)); // Example: 0.5 credits per kg CO2 saved
        }

        // Process directions for map display if available
        try {
          // Create an object to store processed directions for map
          const mapRoutes = {};
          
          // Helper function to properly format the direction data from API
          const formatDirectionsForMap = (routeData, routeIndices, destinations, algorithm) => {
            // First check if we have valid directions data from the API
            if (routeData && routeData.directions && 
                routeData.directions.routes && 
                Array.isArray(routeData.directions.routes) && 
                routeData.directions.routes.length > 0) {
              console.log(`Using API directions for ${algorithm}`);
              return { directions: routeData.directions }; // Return the directions object directly
            }
            
            console.log(`Creating directions request for ${algorithm} using route indices:`, routeIndices);
            
            // If no valid API directions, but we have routeIndices, build a request for Google Maps Directions Service
            if (routeIndices && Array.isArray(routeIndices) && routeIndices.length > 1) {
              // Ensure startPoint is a string address here for consistency
              const originAddress = typeof startPoint === 'string' ? startPoint : (startPoint?.address || 'Bengaluru, Karnataka, India'); 
              // The route always returns to the start point (depot)
              const destinationAddress = originAddress; 

              // Build waypoints array from intermediate indices using string addresses
              const waypoints = routeIndices
                .slice(1, -1) // Get intermediate indices (excluding start 0 and end 0)
                .map(idx => {
                    // Map index back to the original destinations list
                    // Ensure index is valid for the destinations array
                    if (idx > 0 && idx <= destinations.length) {
                        return destinations[idx - 1]; // Index 1 in routeIndices corresponds to index 0 in destinations
                    }
                    return null; // Handle potential invalid indices gracefully
                }) 
                .filter(Boolean) // Remove any null entries if indices were invalid
                .map(location => ({ location: location, stopover: true })); // Format for Directions API

              console.log(`Built waypoints for ${algorithm}:`, waypoints);

              // Return a request object that we can pass to Google Maps Directions service
              return {
                request: {
                  origin: originAddress,
                  destination: destinationAddress,
                  waypoints: waypoints,
                  optimizeWaypoints: false, // IMPORTANT: Keep false to respect the algorithm's calculated order
                  travelMode: "DRIVING"
                }
              };
            }
            
            // If we have no directions and no valid route indices, create a basic fallback request
            console.warn(`No valid directions or routeIndices for ${algorithm}. Creating basic fallback request.`);
            return {
              request: {
                origin: typeof startPoint === 'string' ? startPoint : (startPoint?.address || 'Bengaluru, Karnataka, India'),
                destination: typeof startPoint === 'string' ? startPoint : (startPoint?.address || 'Bengaluru, Karnataka, India'),
                waypoints: destinations.map(dest => ({
                  location: dest,
                  stopover: true
                })),
                optimizeWaypoints: false,
                travelMode: "DRIVING"
              }
            };
          };
          
          // Process IAFSA route
          if (processedResults.iafsa) {
            mapRoutes.iafsa = formatDirectionsForMap(
              processedResults.iafsa,
              processedResults.iafsa.route, // Pass route indices
              destinationsList,
              "IAFSA"
            );
          }
          
          // Process OR-Tools route if selected
          if (comparisonAlgorithms.includes("ortools") && processedResults.ortools) {
            mapRoutes.ortools = formatDirectionsForMap(
              processedResults.ortools,
              processedResults.ortools.route, // Pass route indices
              destinationsList,
              "OR-Tools"
            );
          }
          
          // Process Google Maps route if selected and data exists
          // Note: Backend doesn't currently calculate a specific Google Maps route,
          // so this might receive placeholder data or use fallback logic.
          if (comparisonAlgorithms.includes("googlemaps") && processedResults.googlemaps) {
             // Attempt to get route indices if they exist (might not for placeholder data)
            const googleRouteIndices = processedResults.googlemaps.route;
            mapRoutes.googlemaps = formatDirectionsForMap(
              processedResults.googlemaps,
              googleRouteIndices, // Pass potential route indices
              destinationsList,
              "Google Maps"
            );
          }
          
          // Only set routes if we have valid map route data (either directions or requests)
          if (Object.keys(mapRoutes).length > 0) {
            console.log("Setting map routes:", mapRoutes);
            setRoutes(mapRoutes);
            // Force map re-render with a new key
            setMapKey(Date.now());
          } else {
            console.warn('No valid route data generated for the map.');
          }
        } catch (error) {
          console.error('Error processing directions data:', error);
        }
      } else {
        console.error("Invalid API response format:", response.data);
        alert("Server returned an invalid response format. Please try again later.");
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        setOptimizationError(error.response.data.error || "Server returned an error");
        alert(`Failed to optimize route: ${error.response.data.error || "Unknown server error"}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.log("No response received:", error.request);
        setOptimizationError("No response from server");
        alert("Failed to optimize route: No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error message:", error.message);
        setOptimizationError(error.message);
        alert(`Failed to optimize route: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle route visibility toggle
  const handleViewRoute = (algorithm) => {
    if (visibleRoute === algorithm) {
      setVisibleRoute(null); // Toggle off if clicking the same algorithm
    } else {
      setVisibleRoute(algorithm); // Show the selected algorithm's route
    }
  };

  // Update the slider styling to remove extraneous elements
  const sliderCommonSx = {
    '& .MuiSlider-markLabel': {
      fontSize: '0.875rem',
      fontWeight: 500,
      marginTop: 8,
      // Only display labels at specific points
      '&[data-index="0"], &[data-index="5"], &[data-index="10"]': {
        opacity: 1,
      },
      '&:not([data-index="0"]):not([data-index="5"]):not([data-index="10"])': {
        opacity: 0,
        display: 'none'
      }
    },
    '& .MuiSlider-valueLabel': {
      display: 'none'
    },
    // Hide any extra containers that might contain number labels
    '& div[class*="MuiBox-root"]': {
      display: 'none'
    },
    // More aggressive hiding of all span elements except the essential ones
    '& span:not(.MuiSlider-root):not(.MuiSlider-rail):not(.MuiSlider-track):not(.MuiSlider-thumb):not(.MuiSlider-mark)': {
      display: 'none !important'
    },
    // Added more specific selectors to target specific elements
    '& span[class*="MuiSlider-markLabel"]': {
      '&[data-index="0"], &[data-index="5"], &[data-index="10"]': {
        display: 'block'
      },
      '&:not([data-index="0"]):not([data-index="5"]):not([data-index="10"])': {
        display: 'none !important'
      }
    }
  };

  // Update the available algorithms array to include OR-Tools again
  const availableAlgorithms = [
    { value: 'iafsa', label: 'IAFSA (Our AI)' },
    { value: 'ortools', label: 'Google OR-Tools' }, // Add OR-Tools back
    { value: 'googlemaps', label: 'Google Maps' },
  ];

  // Use comparisonAlgorithms instead of selectedAlgorithms
  <FormControl sx={{ mb: 3, width: '100%' }}>
    <InputLabel id="compare-algorithms-label">Compare With</InputLabel>
    <Select
      labelId="compare-algorithms-label"
      value={comparisonAlgorithms}
      multiple
      onChange={handleComparisonChange}
      renderValue={(selected) => {
        // Update to show "1 algorithm selected" or "X algorithms selected"
        const count = selected.length;
        return `${count} algorithm${count !== 1 ? 's' : ''} selected`;
      }}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 48 * 4.5 + 8,
            width: 250,
          },
        },
      }}
    >
      {availableAlgorithms.map((algorithm) => (
        <MenuItem key={algorithm.value} value={algorithm.value}>
          <Checkbox checked={comparisonAlgorithms.indexOf(algorithm.value) > -1} />
          {algorithm.label}
        </MenuItem>
      ))}
    </Select>
    <FormHelperText>
      Select algorithms to compare with the IAFSA implementation
    </FormHelperText>
  </FormControl>

  return (
    <>
      <Helmet>
        <title>Last-Mile Delivery Optimization | Steadility</title>
      </Helmet>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" color="text.primary" gutterBottom sx={{ mb: 1 }}>
          Last Mile Delivery Optimization
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Optimize routes for time, cost, and carbon emissions.
        </Typography>
        
        <Grid container spacing={3}>
          {/* Left Panel - Inputs */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%', 
                borderRadius: 2,
                boxShadow: theme.shadows[isDarkMode ? 4 : 2]
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.palette.primary.main,
                  fontWeight: 'medium'
                }}
              >
                <RouteOutlined sx={{ mr: 1 }} />
                Route Settings
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Start Point"
                  fullWidth
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  required
                  InputLabelProps={{ sx: { color: isDarkMode ? 'text.secondary' : undefined } }}
                  InputProps={{ sx: { color: isDarkMode ? 'text.primary' : undefined } }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="End Point (Optional)"
                  fullWidth
                  value={endPoint}
                  onChange={(e) => setEndPoint(e.target.value)}
                  placeholder="Enter end location"
                  variant="outlined"
                  disabled={sameAsStart}
                  sx={{ mb: 1 }}
                  InputLabelProps={{ sx: { color: isDarkMode ? 'text.secondary' : undefined } }}
                  InputProps={{
                    startAdornment: <LocationOn sx={{ color: 'primary.main', mr: 1 }} />,
                    sx: { borderRadius: 2, color: isDarkMode ? 'text.primary' : undefined }
                  }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={sameAsStart}
                      onChange={handleSameAsStartToggle}
                      color="primary"
                    />
                  }
                  label="Same as start point"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  label="Destinations"
                  fullWidth
                  multiline
                  rows={5}
                  value={destinations}
                  onChange={handleDestinationsChange}
                  onBlur={handleDestinationsBlur}
                  placeholder="Enter each destination on a new line"
                  variant="outlined"
                  InputLabelProps={{ sx: { color: isDarkMode ? 'text.secondary' : undefined } }}
                  InputProps={{
                    sx: { borderRadius: 2, color: isDarkMode ? 'text.primary' : undefined }
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    onClick={pasteFromClipboard}
                    size="small"
                    startIcon={<ContentPaste />}
                    sx={{ borderRadius: 2 }}
                  >
                    Paste
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={loadSampleData}
                    size="small"
                    startIcon={<FormatListBulleted />}
                    sx={{ borderRadius: 2 }}
                  >
                    Sample Data
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={handleImportCSV}
                    size="small"
                    startIcon={<FileUpload />}
                    sx={{ borderRadius: 2 }}
                  >
                    Import
                  </Button>
                  {/* Hidden file input for CSV import */}
                  <input
                    type="file"
                    accept=".csv,.txt"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.palette.primary.main,
                  fontWeight: 'medium'
                }}
              >
                <CompareArrows sx={{ mr: 1 }} />
                Optimization Priorities
              </Typography>
              
              {/* Update Time Priority Slider */}
              <Box 
                className="slider-container time-slider" 
                sx={{ 
                  position: 'relative', 
                  mb: 2,
                  '& > span': {
                    '& > span:not([class*="MuiSlider-"])': {
                      display: 'none !important'
                    }
                  },
                  // Hide all numeric marks
                  '& span[class*="ValueLabel"], & span[class*="valueLabel"]': {
                    display: 'none !important'
                  }
                }}>
                <Typography id="time-slider-label" gutterBottom color="text.primary">
                  Time Priority
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" color="text.secondary">
                    {timeWeight}%
                  </Typography>
                </Box>
                <Slider
                  aria-labelledby="time-slider-label"
                  value={timeWeight}
                  onChange={(e, value) => handleSliderChange('time', value)}
                  step={null}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 10, label: '' },
                    { value: 20, label: '' },
                    { value: 30, label: '' },
                    { value: 40, label: '' },
                    { value: 50, label: '50%' },
                    { value: 60, label: '' },
                    { value: 70, label: '' },
                    { value: 80, label: '' },
                    { value: 90, label: '' },
                    { value: 100, label: '100%' },
                  ]}
                  min={0}
                  max={100}
                  valueLabelDisplay="off"
                  sx={{ 
                    color: theme.palette.primary.main,
                    '& .MuiSlider-thumb': {
                      height: 24,
                      width: 24,
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}`
                      }
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0.5,
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: theme.palette.primary.main,
                      height: 12,
                      width: 12,
                      borderRadius: '50%',
                      marginTop: 0, // Keep dots on the line
                      '&.MuiSlider-markActive': {
                        opacity: 1,
                        backgroundColor: theme.palette.primary.main,
                      },
                      '&:not(.MuiSlider-markActive)': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.3),
                      }
                    },
                    ...sliderCommonSx
                  }}
                />
              </Box>
              
              {/* Update Cost Priority Slider */}
              <Box 
                className="slider-container cost-slider" 
                sx={{ 
                  position: 'relative', 
                  mb: 2,
                  '& > span': {
                    '& > span:not([class*="MuiSlider-"])': {
                      display: 'none !important'
                    }
                  },
                  // Hide all numeric marks
                  '& span[class*="ValueLabel"], & span[class*="valueLabel"]': {
                    display: 'none !important'
                  }
                }}>
                <Typography id="cost-slider-label" gutterBottom color="text.primary">
                  Cost Priority
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" color="text.secondary">
                    {costWeight}%
                  </Typography>
                </Box>
                <Slider
                  aria-labelledby="cost-slider-label"
                  value={costWeight}
                  onChange={(e, value) => handleSliderChange('cost', value)}
                  step={null}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 10, label: '' },
                    { value: 20, label: '' },
                    { value: 30, label: '' },
                    { value: 40, label: '' },
                    { value: 50, label: '50%' },
                    { value: 60, label: '' },
                    { value: 70, label: '' },
                    { value: 80, label: '' },
                    { value: 90, label: '' },
                    { value: 100, label: '100%' },
                  ]}
                  min={0}
                  max={100}
                  valueLabelDisplay="off"
                  sx={{ 
                    color: theme.palette.secondary.main,
                    '& .MuiSlider-thumb': {
                      height: 24,
                      width: 24,
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.secondary.main, 0.16)}`
                      }
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0.5,
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: theme.palette.secondary.main,
                      height: 12,
                      width: 12,
                      borderRadius: '50%',
                      marginTop: 0,
                      '&.MuiSlider-markActive': {
                        opacity: 1,
                        backgroundColor: theme.palette.secondary.main,
                      },
                      '&:not(.MuiSlider-markActive)': {
                        backgroundColor: alpha(theme.palette.secondary.main, 0.3),
                      }
                    },
                    ...sliderCommonSx
                  }}
                />
              </Box>
              
              {/* Update Carbon Priority Slider */}
              <Box 
                className="slider-container carbon-slider" 
                sx={{ 
                  position: 'relative', 
                  mb: 2,
                  '& > span': {
                    '& > span:not([class*="MuiSlider-"])': {
                      display: 'none !important'
                    }
                  },
                  // Hide all numeric marks
                  '& span[class*="ValueLabel"], & span[class*="valueLabel"]': {
                    display: 'none !important'
                  }
                }}>
                <Typography id="carbon-slider-label" gutterBottom color="text.primary">
                  Carbon Priority
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" color="text.secondary">
                    {carbonWeight}%
                  </Typography>
                </Box>
                <Slider
                  aria-labelledby="carbon-slider-label"
                  value={carbonWeight}
                  onChange={(e, value) => handleSliderChange('carbon', value)}
                  step={null}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 10, label: '' },
                    { value: 20, label: '' },
                    { value: 30, label: '' },
                    { value: 40, label: '' },
                    { value: 50, label: '50%' },
                    { value: 60, label: '' },
                    { value: 70, label: '' },
                    { value: 80, label: '' },
                    { value: 90, label: '' },
                    { value: 100, label: '100%' },
                  ]}
                  min={0}
                  max={100}
                  valueLabelDisplay="off"
                  sx={{ 
                    color: theme.palette.success.main,
                    '& .MuiSlider-thumb': {
                      height: 24,
                      width: 24,
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.success.main, 0.16)}`
                      }
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0.5,
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: theme.palette.success.main,
                      height: 12,
                      width: 12,
                      borderRadius: '50%',
                      marginTop: 0,
                      '&.MuiSlider-markActive': {
                        opacity: 1,
                        backgroundColor: theme.palette.success.main,
                      },
                      '&:not(.MuiSlider-markActive)': {
                        backgroundColor: alpha(theme.palette.success.main, 0.3),
                      }
                    },
                    ...sliderCommonSx
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Fuel Cost per km (₹)"
                  type="number"
                  inputProps={{ step: 0.01, min: 0 }}
                  value={fuelCost}
                  onChange={(e) => setFuelCost(parseFloat(e.target.value))}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ sx: { color: isDarkMode ? 'text.secondary' : undefined } }}
                  InputProps={{
                    startAdornment: <LocalGasStation sx={{ color: 'primary.main', mr: 1 }} />,
                    sx: { borderRadius: 2, color: isDarkMode ? 'text.primary' : undefined }
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Paper
                  elevation={ecoMode ? 2 : 0}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 2,
                    bgcolor: ecoMode 
                      ? (isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)')
                      : (isDarkMode ? 'background.paper' : 'background.default'),
                    border: `1px solid ${ecoMode ? theme.palette.success.main : theme.palette.divider}`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NaturePeople 
                      color={ecoMode ? 'success' : 'action'} 
                      sx={{ mr: 1, transition: 'color 0.3s ease', fontSize: 24 }} 
                    />
                    <Box>
                    <Typography 
                      variant="body1" 
                      fontWeight={ecoMode ? 'medium' : 'normal'}
                      sx={{ transition: 'font-weight 0.3s ease' }}
                    >
                      Eco Mode (Minimize Carbon)
                    </Typography>
                      {/* Remove the description text */}
                    </Box>
                  </Box>
                  <Switch
                    checked={ecoMode}
                    onChange={handleEcoModeChange}
                    color="success"
                  />
                </Paper>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="comparison-select-label">Compare With</InputLabel>
                  <Select
                    labelId="comparison-select-label"
                    value={comparisonAlgorithms}
                    onChange={handleComparisonChange}
                    label="Compare With"
                    multiple
                    sx={{ borderRadius: 2 }}
                    renderValue={(selected) => {
                      if (selected.length === 0) return "None";
                      if (selected.length === 1) {
                        if (selected[0] === "ortools") return "Google OR-Tools";
                        if (selected[0] === "googlemaps") return "Google Maps";
                      }
                      return `${selected.length} algorithm${selected.length !== 1 ? 's' : ''} selected`;
                    }}
                  >
                    <MenuItem value="ortools">
                      <Checkbox checked={comparisonAlgorithms.indexOf("ortools") > -1} />
                      Google OR-Tools
                    </MenuItem>
                    <MenuItem value="googlemaps">
                      <Checkbox checked={comparisonAlgorithms.indexOf("googlemaps") > -1} />
                      Google Maps
                    </MenuItem>
                  </Select>
                  <FormHelperText>
                    Select algorithms to compare with the IAFSA implementation
                  </FormHelperText>
                </FormControl>
              </Box>
              
              <LoadingButton
                fullWidth
                size="large"
                variant="contained"
                onClick={handleOptimize}
                loading={loading}
                startIcon={<DirectionsCar />}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  boxShadow: 4,
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    boxShadow: 6
                  },
                  transition: 'box-shadow 0.3s ease'
                }}
              >
                Optimize Route
              </LoadingButton>
            </Paper>
          </Grid>
          
          {/* Right Panel - Map and Results */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Map */}
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    height: '400px', 
                    p: 0, 
                    overflow: 'hidden', 
                    borderRadius: 2,
                    boxShadow: theme.shadows[isDarkMode ? 4 : 2]
                  }}
                >
                  <Box id="map-container" sx={{ height: '100%', width: '100%', position: 'relative' }}>
                    {mapsError ? (
                      <Box sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center',
                        p: 3,
                        bgcolor: isDarkMode ? 'background.paper' : 'background.default'
                      }}>
                        <Typography color="error" variant="h6" sx={{ mb: 2 }}>
                          Google Maps API Error
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                          {mapsError}. Please check your API key and internet connection.
                        </Typography>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          onClick={() => window.location.reload()}
                          sx={{ borderRadius: 2 }}
                        >
                          Refresh Page
                        </Button>
                      </Box>
                    ) : !mapsLoaded ? (
                      <Box sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }}>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                          Loading Google Maps...
                        </Typography>
                      </Box>
                    ) : (
                      <MapComponent 
                        key={mapKey} // Add key to force re-render only when necessary
                        routes={routes} 
                        destinations={destinationsArray} 
                        startPoint={startPoint || 'Bengaluru, Karnataka, India'} 
                        mapsLoaded={mapsLoaded} 
                        visibleRoute={visibleRoute}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
              
              {/* Results */}
              {results && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={isDarkMode ? 4 : 2} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Route Comparison Results
                      </Typography>
                      
                      {(comparisonAlgorithms.includes("ortools") || comparisonAlgorithms.includes("googlemaps")) && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<BarChart />}
                          onClick={() => setMetricsOpen(true)}
                          sx={{ 
                            borderRadius: 2,
                            boxShadow: 2,
                            '&:hover': {
                              boxShadow: 4
                            }
                          }}
                        >
                          View Detailed Metrics
                        </Button>
                      )}
                    </Box>
                    
                    {/* IAFSA Results - Main algorithm */}
                    {results.iafsa && (
                      <Box sx={{ mb: 4 }}>
                        <KpiCard
                          title="IAFSA Results"
                          distance={Math.abs(results.iafsa.distance).toFixed(2)}
                          cost={Math.abs(results.iafsa.cost).toFixed(2)}
                          carbon={Math.abs(results.iafsa.carbon).toFixed(2)}
                          color={theme.palette.success.main}
                          isPrimary={true}
                          algorithm="iafsa"
                          onViewRoute={handleViewRoute}
                          isRouteVisible={visibleRoute === 'iafsa'}
                          time={Math.abs(results.iafsa.time)}
                        />
                        
                        {/* Add Carbon Credits section */}
                        {carbonCredits > 0 && (
                          <Box sx={{ 
                            mt: 2, 
                            textAlign: 'center', 
                            bgcolor: isDarkMode ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)', 
                            py: 2, 
                            px: 3, 
                            borderRadius: theme.shape.borderRadius,
                            border: '1px dashed',
                            borderColor: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isDarkMode ? '0 0 8px rgba(76, 175, 80, 0.25)' : 'none'
                          }}>
                            <NaturePeople color="success" sx={{ mr: 1, fontSize: 28 }} />
                            <Typography variant="h6" sx={{ color: 'success.dark', fontWeight: 'bold' }}>
                              Carbon Credits Earned: {carbonCredits.toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    {/* Show comparison results if any algorithm is selected */}
                    {(comparisonAlgorithms.includes("ortools") || comparisonAlgorithms.includes("googlemaps")) && (
                      <>
                        <Divider sx={{ my: 4 }} />
                        
                        <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.secondary', fontWeight: 'medium' }}>
                          Comparison Algorithms
                        </Typography>
                        
                        <Grid container spacing={3}>
                          {/* Show OR-Tools results if selected */}
                          {comparisonAlgorithms.includes("ortools") && results.ortools && (
                            <Grid item xs={12} md={comparisonAlgorithms.includes("googlemaps") && results.googlemaps ? 6 : 12}>
                              <KpiCard
                                title="OR-Tools Results"
                                distance={Math.abs(results.ortools.distance).toFixed(2)}
                                cost={Math.abs(results.ortools.cost).toFixed(2)}
                                carbon={Math.abs(results.ortools.carbon).toFixed(2)}
                                color="#2196F3"
                                isPrimary={false}
                                algorithm="ortools"
                                onViewRoute={handleViewRoute}
                                isRouteVisible={visibleRoute === 'ortools'}
                                time={Math.abs(results.ortools.time)}
                              />
                            </Grid>
                          )}
                          
                          {/* Show Google Maps results if selected */}
                          {comparisonAlgorithms.includes("googlemaps") && results.googlemaps && (
                            <Grid item xs={12} md={comparisonAlgorithms.includes("ortools") && results.ortools ? 6 : 12}>
                              <KpiCard
                                title="Google Maps Results"
                                distance={Math.abs(results.googlemaps.distance).toFixed(2)}
                                cost={Math.abs(results.googlemaps.cost).toFixed(2)}
                                carbon={Math.abs(results.googlemaps.carbon).toFixed(2)}
                                color="#FF9800"
                                isPrimary={false}
                                algorithm="googlemaps"
                                onViewRoute={handleViewRoute}
                                isRouteVisible={visibleRoute === 'googlemaps'}
                                time={Math.abs(results.googlemaps.time)}
                              />
                            </Grid>
                          )}
                        </Grid>
                      </>
                    )}
                    
                    {/* Debug info in development mode */}
                    {process.env.NODE_ENV === 'development' && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Selected algorithms: {JSON.stringify(comparisonAlgorithms)}
                        </Typography>
                        {comparisonAlgorithms.includes("googlemaps") && !results.googlemaps && (
                          <Typography variant="caption" color="error">
                            Google Maps selected but no results data found
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
      
      {/* Metrics comparison dialog */}
      <ComparisonMetricsDialog 
        open={metricsOpen} 
        onClose={() => setMetricsOpen(false)} 
        results={results}
        algorithms={comparisonAlgorithms}
      />
    </>
  );
} 