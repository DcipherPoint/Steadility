import React, { useState, Suspense } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

// Lazy load the Sankey component
const ResponsiveSankey = React.lazy(() => import('@nivo/sankey').then(module => ({
  default: module.ResponsiveSankey
})));

const EmissionsImpactChart = () => {
  const { darkMode } = useTheme();
  const [isLoading] = useState(false);
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const data = {
    nodes: [
      { id: 'Transportation', color: 'rgb(97, 205, 187)' },
      { id: 'Warehousing', color: 'rgb(244, 117, 96)' },
      { id: 'Route1', color: 'rgb(241, 225, 91)' },
      { id: 'Route2', color: 'rgb(232, 168, 56)' },
      { id: 'Electric', color: 'rgb(151, 227, 213)' },
      { id: 'Hybrid', color: 'rgb(141, 211, 199)' },
      { id: 'Diesel', color: 'rgb(251, 128, 114)' }
    ],
    links: [
      { source: 'Transportation', target: 'Route1', value: 20 },
      { source: 'Transportation', target: 'Route2', value: 15 },
      { source: 'Route1', target: 'Electric', value: 10 },
      { source: 'Route1', target: 'Hybrid', value: 5 },
      { source: 'Route2', target: 'Hybrid', value: 7 },
      { source: 'Route2', target: 'Diesel', value: 8 }
    ]
  };

  return (
    <>
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
        EMISSIONS FLOW ANALYSIS
      </h2>
      <div className="h-[240px]">
        <Suspense fallback={
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <ResponsiveSankey
            data={data}
            margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
            align="justify"
            colors={{ scheme: 'category10' }}
            nodeOpacity={1}
            nodeThickness={16}
            nodeInnerPadding={3}
            nodeSpacing={24}
            nodeBorderWidth={0}
            linkOpacity={0.5}
            linkHoverOpsacity={0.8}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={16}
            theme={{
              labels: {
                text: {
                  fontSize: 11,
                  fill: darkMode ? '#E5E7EB' : '#4B5563',
                  fontWeight: 600
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
            animate={true}
            motionConfig="gentle"
            tooltip={({ node }) => (
              <div className="flex flex-col gap-1">
                <strong className="text-sm font-semibold">{node.id}</strong>
                <span className="text-sm">{node.value} tons CO₂</span>
              </div>
            )}
          />
        </Suspense>
      </div>
    </>
  );
};

export default EmissionsImpactChart;
