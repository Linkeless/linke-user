/**
 * Test button to manually trigger API calls for debugging
 */

import React from 'react';
import { apiClient } from '@/lib/api/client';
import { USER_ENDPOINTS } from '@/lib/api/endpoints';

export function ApiTestButton() {
  const [result, setResult] = React.useState<string>('');

  const testApiCall = async () => {
    try {
      setResult('Making API call...');
      console.log('🧪 Test API call starting...');

      const response = await apiClient.get(USER_ENDPOINTS.PROFILE);
      console.log('🧪 Test API call successful:', response.data);
      setResult(`Success: ${response.status}`);
    } catch (error: any) {
      console.error('🧪 Test API call failed:', error);
      setResult(`Error: ${error.message || error.response?.status}`);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: '#333',
        color: '#fff',
        padding: '10px',
        fontSize: '12px',
        zIndex: 9999,
        borderRadius: '4px',
      }}
    >
      <button
        onClick={testApiCall}
        style={{
          background: '#007acc',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          marginBottom: '5px',
        }}
      >
        Test API Call
      </button>
      <div>Result: {result}</div>
    </div>
  );
}
