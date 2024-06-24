import { Filter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Breadcrumbs from '~/components/Breadcrumbs';
import Filters from '~/components/Filters';
import FiltersBar from '~/components/FiltersBar';
import Grid from '~/components/Grid';
import api from '~/services/api';
import FilialsPreview from './Preview';
import { applyFilters } from '~/functions';
import PageHeader from '~/components/PageHeader';

export default function AdministrativeFilials() {
  const [activeFilters, setActiveFilters] = useState([])
  const [opened, setOpened] = useState(false)
  const [orderBy, setOrderBy] = useState({ column: 'Name', asc: true })
  const [gridHeader, setGridHeader] = useState([
    {
      title: 'Active',
      type: 'boolean',
      filter: true,
    },
    {
      title: 'Alias',
      type: 'text',
      filter: true,
    },
    {
      title: 'Name',
      type: 'text',
      filter: true,
    },
    {
      title: 'Type',
      type: 'text',
      filter: true,
    },
    {
      title: 'Ein',
      type: 'text',
      filter: true,
    },
    {
      title: 'City',
      type: 'text',
      filter: true,
    },
    {
      title: 'State',
      type: 'text',
      filter: true,
    },
    {
      title: 'Country',
      type: 'text',
      filter: true,
    }
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
    async function getFilials() {
      const { data } = await api.get('/filials')
      const gridDataValues = data.map(({ id, active, alias, name, Filialtype, ein, city, state, country }) => {
        const type = Filialtype.name;
        return { show: true, id, fields: [active, alias, name, type, ein, city, state, country] }
      })
      setGridData(gridDataValues)
    }
    getFilials()
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
      {opened && <FilialsPreview id={opened} handleOpened={handleOpened} setOpened={setOpened} />}
    </Grid>
  </div>;
}
