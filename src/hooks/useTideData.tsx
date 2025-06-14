
import { useState, useEffect } from 'react';
import { 
  getCurrentTideData,
  getWeeklyTideForecast,
  TidePoint,
  TideForecast
} from '@/services/noaaService';
import { getStationId } from '@/services/locationService';
import { getCurrentDateString, getCurrentTimeString, formatApiDate } from '@/utils/dateTimeUtils';

type UseTideDataParams = {
  location: {
    id: string;
    name: string;
    country: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
  } | null;
};

type UseTideDataReturn = {
  isLoading: boolean;
  error: string | null;
  tideData: TidePoint[];
  weeklyForecast: TideForecast[];
  currentDate: string;
  currentTime: string;
  stationName: string | null;
};

export const useTideData = ({ location }: UseTideDataParams): UseTideDataReturn => {
  console.log('🪝 useTideData hook called with location:', location);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tideData, setTideData] = useState<TidePoint[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<TideForecast[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(getCurrentDateString());
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeString());
  const [stationName, setStationName] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useTideData effect triggered with location:', location);
    console.log('📍 Location details - ZIP:', location?.zipCode, 'Name:', location?.name, 'Lat/Lng:', location?.lat, location?.lng);
    
    // Always set current date and time, regardless of location
    const newDate = getCurrentDateString();
    const newTime = getCurrentTimeString();
    console.log('📅 Setting current date/time:', { newDate, newTime });
    setCurrentDate(newDate);
    setCurrentTime(newTime);

    // If no location is provided, use mock data but keep current date/time
    if (!location) {
      console.log('⚠️ No location provided, using mock data');
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchTideData = async () => {
      try {
        console.log('🚀 Starting tide data fetch for location:', location.name);
        console.log('🔍 Location ZIP code for station lookup:', location.zipCode);
        setIsLoading(true);
        setError(null);
        
        // Get station ID using the location service
        console.log('🏭 Calling getStationId...');
        const { stationId, stationName: foundStationName } = await getStationId(location);
        console.log('🏭 getStationId returned:', { stationId, foundStationName });
        console.log('🎯 Station mapping result - Station ID:', stationId, 'Station Name:', foundStationName);
        
        if (foundStationName) {
          setStationName(foundStationName);
          console.log('🏷️ Set station name:', foundStationName);
        }
        
        console.log(`🌊 Fetching tide data for station: ${stationId}`);
        
        // Get current tide data for chart
        try {
          console.log('📊 Calling getCurrentTideData API...');
          const currentData = await getCurrentTideData(stationId);
          console.log('📊 getCurrentTideData response:', {
            tideDataLength: currentData.tideData.length,
            date: currentData.date,
            currentTime: currentData.currentTime,
            sampleData: currentData.tideData.slice(0, 3)
          });
          
          // Log first few data points to verify they're for the right location
          if (currentData.tideData.length > 0) {
            console.log('🌊 First few tide data points:', currentData.tideData.slice(0, 5));
          }
          
          setTideData(currentData.tideData);
          console.log('📊 Set tide data with length:', currentData.tideData.length);
          
          // Only update date if we got a valid date from the API
          if (currentData.date) {
            const formattedDate = formatApiDate(currentData.date);
            setCurrentDate(formattedDate);
            console.log(`📅 Updated date from API: ${formattedDate}`);
          } else {
            console.log('📅 No date from API, keeping current date');
          }
          
          // Only update time if we got valid time from the API
          if (currentData.currentTime) {
            setCurrentTime(currentData.currentTime);
            console.log(`⏰ Updated time from API: ${currentData.currentTime}`);
          } else {
            console.log('⏰ No time from API, keeping current time');
          }
        } catch (currentDataError) {
          console.error('❌ Error getting current tide data:', currentDataError);
          throw new Error('Failed to fetch current tide data');
        }
        
        // Get weekly forecast
        try {
          console.log('📅 Calling getWeeklyTideForecast API...');
          const forecast = await getWeeklyTideForecast(stationId);
          console.log('📅 getWeeklyTideForecast response:', {
            forecastLength: forecast.length,
            sampleForecast: forecast.slice(0, 2)
          });
          
          // Log forecast details to verify correctness
          if (forecast.length > 0) {
            console.log('📊 First forecast day details:', forecast[0]);
          }
          
          setWeeklyForecast(forecast);
          console.log('📅 Set weekly forecast with length:', forecast.length);
        } catch (forecastError) {
          console.error('⚠️ Error getting weekly forecast (non-fatal):', forecastError);
          setWeeklyForecast([]);
        }
        
        console.log('✅ Tide data fetch completed successfully');
        setIsLoading(false);
      } catch (err) {
        console.error('💥 Fatal error fetching tide data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tide data');
        setIsLoading(false);
        
        // Set empty data but keep current date/time
        setTideData([]);
        setWeeklyForecast([]);
      }
    };

    fetchTideData();
  }, [location]);

  const result = {
    isLoading,
    error,
    tideData,
    weeklyForecast,
    currentDate,
    currentTime,
    stationName
  };

  console.log('🪝 useTideData returning:', {
    ...result,
    tideDataLength: result.tideData.length,
    weeklyForecastLength: result.weeklyForecast.length
  });

  return result;
};
