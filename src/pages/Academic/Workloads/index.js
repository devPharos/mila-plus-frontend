import { Filter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Breadcrumbs from '~/components/Breadcrumbs';
import Filters from '~/components/Filters';
import FiltersBar from '~/components/FiltersBar';
import Grid from '~/components/Grid';
import api from '~/services/api';
import { applyFilters } from '~/functions';
import PageHeader from '~/components/PageHeader';
import WorkloadPreview from './Preview';

export default function Workloads() {
  const [activeFilters, setActiveFilters] = useState([])
  const [opened, setOpened] = useState(false)
  const [orderBy, setOrderBy] = useState({ column: 'Name', asc: true })
  const [gridHeader, setGridHeader] = useState([
    {
      title: 'Level',
      type: 'text',
      filter: true,
    },
    {
      title: 'Language Mode',
      type: 'text',
      filter: true,
    },
    {
      title: 'Name',
      type: 'text',
      filter: true,
    },
    {
      title: 'Day per Week',
      type: 'text',
      filter: false,
    },
    {
      title: 'Hours per Day',
      type: 'text',
      filter: false,
    },
  ])

  const [gridData, setGridData] = useState()

  function handleFilters({ title = '', value = '' }) {
    if (value || (title === 'Active' && value !== '')) {
      setActiveFilters([...activeFilters.filter(el => el.title != title), { title, value }])
    } else {
      setActiveFilters([...activeFilters.filter(el => el.title != title)])
    }
  }

  useEffect(() => {
    async function getData() {
      const { data } = await api.get('/workloads')
      const gridDataValues = data.map(({ id, name, Level, Languagemode, days_per_week, hours_per_day }) => {
        if (!name) {
          name = `${days_per_week.toString()} day(s) per week, ${hours_per_day.toString()} hour(s) per day.`
        }
        const level_name = Level.Programcategory.name + ' - ' + Level.name;
        const languagemode_name = Languagemode.name;
        return { show: true, id, fields: [level_name, languagemode_name, name, days_per_week, hours_per_day] }
      })
      setGridData(gridDataValues)
    }
    getData()
  }, [opened])

  function handleOpened(id) {
    setOpened(id)
  }

  useEffect(() => {
    if (gridData && gridHeader) {
      applyFilters(activeFilters, gridData, gridHeader, orderBy, setGridData)
    }
  }, [activeFilters, orderBy])

  return <div className='h-full bg-white flex flex-1 flex-col justify-between items-start rounded-tr-2xl px-4'>
    <PageHeader>
      <Breadcrumbs />
      <FiltersBar>
        <Filter size={14} /> Custom Filters
      </FiltersBar>
    </PageHeader>
    <Filters handleNew={() => setOpened('new')} search handleFilters={handleFilters} gridHeader={gridHeader} gridData={gridData} setGridHeader={setGridHeader} activeFilters={activeFilters} />

    <Grid gridData={gridData} gridHeader={gridHeader} orderBy={orderBy} setOrderBy={setOrderBy} handleOpened={handleOpened} opened={opened}>
      {opened && <div className='fixed left-0 top-0 z-50 w-full h-full' style={{ background: 'rgba(0,0,0,.2)' }}></div>}
      {opened && <WorkloadPreview id={opened} handleOpened={handleOpened} setOpened={setOpened} defaultFormType='full' />}
    </Grid>
  </div>;
}
