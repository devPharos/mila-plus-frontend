import { ArrowUpDown, Filter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Breadcrumbs from '../../../components/Breadcrumbs';
import FiltersBar from '../../../components/FiltersBar';
import Filters from '../../../components/Filters';
import Grid from '~/components/Grid';
import StudentPreview from '~/components/Grid/StudentPreview';

export default function ComercialStudents() {
  const [activeFilters, setActiveFilters] = useState([])
  const [opened, setOpened] = useState(false)
  const [orderBy, setOrderBy] = useState({ column: 'Scheduled Date', asc: true })
  const [gridHeader, setGridHeader] = useState([
    {
      title: 'Avatar',
      type: 'image',
      filter: null,
    },
    {
      title: 'Student Name',
      type: 'text',
      filter: true,
      action: {
        icon: 'ArrowUpRightFromSquare',

      }
    },
    {
      title: 'Registration Number',
      type: 'text',
      filter: true,
    },
    {
      title: 'Category',
      type: 'text',
      filter: true,
    },
    {
      title: 'Type',
      type: 'text',
      filter: true,
    },
    {
      title: 'Responsible Agent',
      type: 'text',
      filter: true,
    },
    {
      title: 'E-mail',
      type: 'text',
      filter: false
    },
  ])

  const [gridData, setGridData] = useState([
    {
      show: true,
      id: 1,
      fields: [
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        'Daniel Paulo de Souza',
        'ORL000611',
        'Student',
        'F1',
        'Michel Tolentino',
        'dansouz1712@gmail.com'
      ]
    },
    {
      show: true,
      id: 2,
      fields: [
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        'Rossiter Emmanuel Vital Rosalino',
        'ORL002013',
        'Student',
        'F1',
        'Jessi',
        'emmanuelrossi@gmail.com'
      ]
    },
  ])
  
  function handleFilters({ title = '', value = '' }) {
    if(value) {
      setActiveFilters([...activeFilters.filter(el => el.title != title), {title, value}])
    } else {
      setActiveFilters([...activeFilters.filter(el => el.title != title)])
    }
  }

  function handleOpened(id) {
    setOpened(null)
    setTimeout(() => {
      setOpened(id)
    },250)
  }
  
  useEffect(() => {
    function applyFilters() {

      const search = activeFilters.filter(el => el.title === 'search');
      const filters = activeFilters.filter(el => el.title !== 'search');

        const newData = gridData.map((line) => {
          line.show = true;
          filters.forEach(filter => {
            const fieldPos = gridHeader.findIndex((el) => el.title === filter.title);
            if(fieldPos > -1) {
              if(Array.isArray(filter.value)) {
                console.log(filter.value);
              } else {
                if(line.fields[fieldPos].toUpperCase().search(filter.value.toUpperCase()) === -1) {
                  line.show = false;
                }
              }
            }
          })

          if(search.length > 0 && line.show) {
            line.show = false;
            line.fields.map((field) => {
              if(field.toUpperCase().search(search[0].value.toUpperCase()) > -1) {
                line.show = true;
              }
            })
          }
          

          return line
        })

        if(orderBy.column) {
          const fieldPos = gridHeader.findIndex((el) => el.title === orderBy.column);
          newData.sort((a,b) => orderBy.asc ? a.fields[fieldPos] > b.fields[fieldPos] : a.fields[fieldPos] < b.fields[fieldPos])
        }
  
      setGridData(newData)
  
    }
    applyFilters()
  },[activeFilters, orderBy])

  return <div className='h-full bg-white flex flex-1 flex-col justify-between items-start rounded-tr-2xl p-4'>
  <div className='border-b w-full flex flex-row justify-between items-start px-2'>
    <Breadcrumbs />
    <FiltersBar>
      <Filter size={14} /> Custom Filters
    </FiltersBar>
  </div>
  
  <Filters search handleFilters={handleFilters} gridHeader={gridHeader} gridData={gridData} setGridHeader={setGridHeader} activeFilters={activeFilters} />
  
  <Grid gridData={gridData} gridHeader={gridHeader} orderBy={orderBy} setOrderBy={setOrderBy} handleOpened={handleOpened} opened={opened}>
    {opened && <div className='fixed left-0 top-0 z-50 w-full h-full' style={{ background: 'rgba(0,0,0,.2)' }}></div>}
    {opened && <StudentPreview id={opened} handleOpened={handleOpened} />}
  </Grid>

</div>;
}
