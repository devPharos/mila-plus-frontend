import React from 'react';
import Breadcrumbs from '~/components/Breadcrumbs';

export default function FinancialDashboard() {

  return <div className='h-full bg-white flex flex-1 flex-col justify-between items-start rounded-tr-2xl p-4'>
  <div className='border-b w-full flex flex-row justify-between items-start pb-2 px-2'>
    <Breadcrumbs />
    
  </div>
  

</div>;
}
