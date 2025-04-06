import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useTheme } from '../../contexts/ThemeContext';

const PredictiveChart = ({ data }) => {
  const { darkMode } = useTheme();

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">CO₂ EMISSIONS FORECAST</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Next 30 days prediction</p>
        </div>
        {data.prediction > data.current && (
          <div className="flex items-center text-red-500 text-sm">
            <span className="inline-block mr-1">⚠️</span>
            Increasing trend detected
          </div>
        )}
      </div>
      <div className="h-[240px]">
        <ResponsiveLine
          data={[
            {
              id: "Actual",
              data: data.historical
            },
            {
              id: "Predicted",
              data: data.forecast
            }
          ]}
          margin={{ top: 30, right: 80, bottom: 40, left: 70 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
          curve="monotoneX"
          enablePointLabel={true}
          pointSize={6}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          enableArea={true}
          areaOpacity={0.1}
          enableGridX={false}
          axisLeft={{
            tickSize: 5,
            tickPadding: 12,
            tickRotation: 0,
            legend: 'CO₂ (tons)',
            legendOffset: -45,
            legendPosition: 'middle'
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 12,
            tickRotation: 0,
            legend: 'Time Period',
            legendOffset: 35,
            legendPosition: 'middle'
          }}
          legends={[
            {
              anchor: 'top-right',
              direction: 'row',
              justify: false,
              translateX: -10,
              translateY: -20,
              itemsSpacing: 20,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              symbolSize: 8,
              symbolShape: 'circle',
              itemTextColor: darkMode ? '#E5E7EB' : '#4B5563',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemTextColor: darkMode ? '#F9FAFB' : '#111827'
                  }
                }
              ]
            }
          ]}
          theme={{
            axis: {
              ticks: {
                text: {
                  fontSize: 11,
                  fill: darkMode ? '#E5E7EB' : '#4B5563'
                }
              },
              legend: {
                text: {
                  fontSize: 11,
                  fill: darkMode ? '#E5E7EB' : '#4B5563',
                  fontWeight: 600
                }
              }
            },
            grid: {
              line: {
                stroke: darkMode ? '#374151' : '#E5E7EB',
                strokeWidth: 1,
                strokeDasharray: '4 4'
              }
            },
            tooltip: {
              container: {
                background: darkMode ? '#1F2937' : '#FFFFFF',
                color: darkMode ? '#F3F4F6' : '#4B5563',
                fontSize: 12,
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                padding: '8px 12px',
                border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB'
              }
            }
          }}
        />
      </div>
    </>
  );
};

export default PredictiveChart;
