import { Filter } from 'lucide-react';
import React, { useState } from 'react';
import Breadcrumbs from '~/components/Breadcrumbs';
import Filters from '~/components/Filters';
import FiltersBar from '~/components/FiltersBar';
import Grid from '~/components/Grid';

export default function HoldingDashboard() {
  const [activeFilters, setActiveFilters] = useState([])
  const [orderBy, setOrderBy] = useState({ column: 'Scheduled Date', asc: true })
  const [gridHeader, setGridHeader] = useState(null)

  const [gridData, setGridData] = useState([
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Daniel Paulo de Souza',
        'F1',
        'Initial',
        'On Going',
        'Placement Test',
        '03/02/2024 @ 17:00',
        'Test booked.',
        '03/01/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Denis Marcos Varella',
        'F1',
        'Initial',
        'Enrollment',
        'Form Filling',
        '03/02/2024 @ 17:00',
        'Student has`t started yet.',
        '03/02/2024'
      ]
    }, {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Daniel Paulo de Souza',
        'F1',
        'Initial',
        'On Going',
        'Interview',
        '03/02/2024 @ 17:00',
        'Date not booked yet.',
        '03/03/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Denis Marcos Varella',
        'F1',
        'Initial',
        'Enrollment',
        'Form Filling',
        '03/02/2024 @ 17:00',
        'Student has`t started yet.',
        '03/04/2024'
      ]
    }, {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Daniel Paulo de Souza',
        'F1',
        'Initial',
        'On Going',
        'Placement Test',
        '03/02/2024 @ 17:00',
        'Test booked.',
        '03/05/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Denis Marcos Varella',
        'F1',
        'Initial',
        'Enrollment',
        'Form Filling',
        '03/02/2024 @ 17:00',
        'Student has`t started yet.',
        '03/05/2024'
      ]
    }, {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Daniel Paulo de Souza',
        'F1',
        'Initial',
        'On Going',
        'Placement Test',
        '03/02/2024 @ 17:00',
        'Test booked.',
        '03/05/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Denis Marcos Varella',
        'F1',
        'Initial',
        'Enrollment',
        'Form Filling',
        '03/02/2024 @ 17:00',
        'Student has`t started yet.',
        '03/05/2024'
      ]
    }, {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Daniel Paulo de Souza',
        'F1',
        'Initial',
        'On Going',
        'Placement Test',
        '03/02/2024 @ 17:00',
        'Test booked.',
        '03/05/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Denis Marcos Varella',
        'F1',
        'Initial',
        'Enrollment',
        'Form Filling',
        '03/02/2024 @ 17:00',
        'Student has`t started yet.',
        '03/01/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Daniel Paulo de Souza',
        'F1',
        'Initial',
        'On Going',
        'Placement Test',
        '03/02/2024 @ 17:00',
        'Test booked.',
        '03/04/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Denis Marcos Varella',
        'F1',
        'Initial',
        'Enrollment',
        'Form Filling',
        '03/02/2024 @ 17:00',
        'Student has`t started yet.',
        '03/03/2024'
      ]
    }, {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Daniel Paulo de Souza',
        'F1',
        'Initial',
        'On Going',
        'Interview',
        '03/02/2024 @ 17:00',
        'Date not booked yet.',
        '03/02/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Denis Marcos Varella',
        'F1',
        'Initial',
        'Enrollment',
        'Form Filling',
        '03/02/2024 @ 17:00',
        'Student has`t started yet.',
        '03/01/2024'
      ]
    }, {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Daniel Paulo de Souza',
        'F1',
        'Initial',
        'On Going',
        'Placement Test',
        '03/02/2024 @ 17:00',
        'Test booked.',
        '03/05/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Denis Marcos Varella',
        'F1',
        'Initial',
        'Enrollment',
        'Form Filling',
        '03/02/2024 @ 17:00',
        'Student has`t started yet.',
        '03/05/2024'
      ]
    }, {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Daniel Paulo de Souza',
        'F1',
        'Initial',
        'On Going',
        'Placement Test',
        '03/02/2024 @ 17:00',
        'Test booked.',
        '03/05/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Denis Marcos Varella',
        'F1',
        'Initial',
        'Enrollment',
        'Form Filling',
        '03/02/2024 @ 17:00',
        'Student has`t started yet.',
        '03/05/2024'
      ]
    }, {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Daniel Paulo de Souza',
        'F1',
        'Initial',
        'On Going',
        'Placement Test',
        '03/02/2024 @ 17:00',
        'Test booked.',
        '03/05/2024'
      ]
    },
    {
      show: true,
      fields: [
        '03/01/2024 @ 12:42',
        'Denis Marcos Varella',
        'F1',
        'Initial',
        'Enrollment',
        'Form Filling',
        '03/02/2024 @ 17:00',
        'Student has`t started yet.',
        '03/05/2024'
      ]
    },
  ])

  function handleFilters({ title = '', value = '' }) {
    if (value || typeof value === 'boolean') {
      setActiveFilters([...activeFilters.filter(el => el.title != title), { title, value }])
    } else {
      setActiveFilters([...activeFilters.filter(el => el.title != title)])
    }
  }

  return <div className='h-full bg-white flex flex-1 flex-col justify-between items-start rounded-tr-2xl p-4'>
    <div className='border-b w-full flex flex-row justify-between items-start px-2'>
      <Breadcrumbs />
      <FiltersBar>
        <Filter size={14} /> Custom Filters
      </FiltersBar>
    </div>
    <Filters search handleFilters={handleFilters} gridHeader={gridHeader} gridData={gridData} setGridHeader={setGridHeader} activeFilters={activeFilters} />

    <Grid gridData={gridData} gridHeader={gridHeader} orderBy={orderBy} setOrderBy={setOrderBy} />

    <div style={{ flex: 1, width: '100%' }}>
      Teste
    </div>
  </div>;
}
