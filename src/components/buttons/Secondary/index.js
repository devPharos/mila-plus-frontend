import React from 'react';

// import { Container } from './styles';

export default function Secondary({ children }) {
  return (
  <div className={`rounded-xl p-2 bg-secondary flex flex-row justify-center items-center cursor-pointer hover:ring hover:ring-secondary-50`}>
    {children}
  </div>);
}