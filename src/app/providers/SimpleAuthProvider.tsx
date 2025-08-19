import React from 'react';

export function SimpleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('SimpleAuthProvider rendering');
  return <>{children}</>;
}
