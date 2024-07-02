import { Filter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Breadcrumbs from '../../../components/Breadcrumbs';
import FiltersBar from '../../../components/FiltersBar';
import Filters from '../../../components/Filters';
import Grid from '~/components/Grid';

export default function ComercialDashboard() {
  const [activeFilters, setActiveFilters] = useState([])
  const [orderBy, setOrderBy] = useState({ column: 'Scheduled Date', asc: true })
  const { accesses } = useSelector(state => state.auth);
  const currentPage = getCurrentPage();
  const [gridHeader, setGridHeader] = useState([
    {
      title: 'Initial Date',
      type: 'date',
      filter: false,
    },
    {
      title: 'Prospect',
      type: 'text',
      filter: false,
    },
    {
      title: 'Type',
      type: 'text',
      filter: true,
    },
    {
      title: 'Sub Status',
      type: 'text',
      filter: true,
    },
    {
      title: 'Phase',
      type: 'text',
      filter: true,
    },
    {
      title: 'Phase Steps',
      type: 'text',
      filter: true,
    },
    {
      title: 'Step Date',
      type: 'date',
      filter: true,
    },
    {
      title: 'Step Status',
      type: 'text',
      filter: true,
    },
    {
      title: 'Scheduled Date',
      type: 'date',
      filter: true,
    }
  ])

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
    if (value) {
      setActiveFilters([...activeFilters.filter(el => el.title != title), { title, value }])
    } else {
      setActiveFilters([...activeFilters.filter(el => el.title != title)])
    }
  }

  useEffect(() => {
    function applyFilters() {

      const search = activeFilters.filter(el => el.title === 'search');
      const filters = activeFilters.filter(el => el.title !== 'search');

      const newData = gridData.map((line) => {
        line.show = true;
        filters.forEach(filter => {
          const fieldPos = gridHeader.findIndex((el) => el.title === filter.title);
          if (fieldPos > -1) {
            if (Array.isArray(filter.value)) {
              console.log(filter.value);
            } else {
              if (line.fields[fieldPos].toUpperCase().search(filter.value.toUpperCase()) === -1) {
                line.show = false;
              }
            }
          }
        })

        if (search.length > 0 && line.show) {
          line.show = false;
          line.fields.map((field) => {
            if (field.toUpperCase().search(search[0].value.toUpperCase()) > -1) {
              line.show = true;
            }
          })
        }


        return line
      })

      if (orderBy.column) {
        const fieldPos = gridHeader.findIndex((el) => el.title === orderBy.column);
        newData.sort((a, b) => orderBy.asc ? a.fields[fieldPos] > b.fields[fieldPos] : a.fields[fieldPos] < b.fields[fieldPos])
      }

      setGridData(newData)

    }
    applyFilters()
  }, [activeFilters, orderBy])

  return <div className='h-full bg-white flex flex-1 flex-col justify-between items-start rounded-tr-2xl p-4'>
    <div className='border-b w-full flex flex-row justify-between items-start px-2'>
      <Breadcrumbs currentPage={currentPage} />
      <FiltersBar>
        <Filter size={14} /> Custom Filters
      </FiltersBar>
    </div>

    <Filters search handleFilters={handleFilters} gridHeader={gridHeader} gridData={gridData} setGridHeader={setGridHeader} activeFilters={activeFilters} />

    <Grid gridData={gridData} gridHeader={gridHeader} orderBy={orderBy} setOrderBy={setOrderBy} />

  </div>;
}
