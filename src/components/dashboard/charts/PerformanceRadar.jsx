import React from 'react';
import { ResponsiveRadar } from '@nivo/radar';
import { useTheme } from '../../../contexts/ThemeContext';

const PerformanceRadar = () => {
  const { darkMode } = useTheme();

  const data = [
    {
      metric: "Fuel Efficiency",
      "Electric Fleet": 90,
      "Hybrid Fleet": 75,
      "Regular Fleet": 60
    },
    {
      metric: "Route Adherence",
      "Electric Fleet": 85,
      "Hybrid Fleet": 88,
      "Regular Fleet": 82
    },
    {
      metric: "Time Efficiency",
      "Electric Fleet": 78,
      "Hybrid Fleet": 80,
      "Regular Fleet": 85
    },
    {
      metric: "CO2 Reduction",
      "Electric Fleet": 95,
      "Hybrid Fleet": 80,
      "Regular Fleet": 55
    },
    {
      metric: "Cost Efficiency",
      "Electric Fleet": 82,
      "Hybrid Fleet": 85,
      "Regular Fleet": 75
    }
  ];

  return (
    <>
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
        FLEET PERFORMANCE COMPARISON
      </h2>
      <div className="h-[240px]">
        <ResponsiveRadar
          data={data}
          keys={['Electric Fleet', 'Hybrid Fleet', 'Regular Fleet']}
          indexBy="metric"
          maxValue={100}
          margin={{ top: 30, right: 100, bottom: 30, left: 100 }}
          curve="linearClosed"
          borderWidth={2}
          borderColor={{ from: 'color' }}
          gridLevels={4}
          gridShape="circular"
          gridLabelOffset={20}
          enableDots={true}
          dotSize={6}
          dotColor={{ theme: 'background' }}
          dotBorderWidth={1}
          dotBorderColor={{ from: 'color' }}
          enableDotLabel={false}
          colors={{ scheme: 'category10' }}
          fillOpacity={0.2}
          blendMode="multiply"
          animate={true}
          theme={{
            text: {
              fontSize: 11,
              fill: darkMode ? '#E5E7EB' : '#4B5563',
              fontWeight: 600
            },
            tooltip: {
              container: {
                background: darkMode ? '#374151' : '#FFFFFF',
                color: darkMode ? '#E5E7EB' : '#4B5563',
                fontSize: 12,
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '8px 12px'
              }
            }
          }}
          tooltip={({ point }) => (
            <div className="flex flex-col">
              <strong className="mb-1">{point.data.metric}</strong>
              <span>{point.key}: {point.value}</span>
            </div>
          )}
        />
      </div>
    </>
  );
};

export default PerformanceRadar;
