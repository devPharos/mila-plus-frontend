import { Filter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Breadcrumbs from '~/components/Breadcrumbs';
import Filters from '~/components/Filters';
import FiltersBar from '~/components/FiltersBar';
import Grid from '~/components/Grid';
import api from '~/services/api';
import { applyFilters, getCurrentPage, hasAccessTo } from '~/functions';
import PageHeader from '~/components/PageHeader';
import PagePreview from './Preview';
import { useSelector } from 'react-redux';

export default function AdministrativeChartOfAccounts() {
  const [activeFilters, setActiveFilters] = useState([])
  const [opened, setOpened] = useState(false)
  const [orderBy, setOrderBy] = useState({ column: 'Code', asc: true })
  const { accesses } = useSelector(state => state.auth);
  const currentPage = getCurrentPage();
  const [gridHeader, setGridHeader] = useState([
    {
      title: 'Code',
      type: 'text',
      filter: false,
    },
    {
      title: 'Name',
      type: 'text',
      filter: false,
    },
    {
      title: 'Type',
      type: 'text',
      filter: true,
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
    async function getFilials() {
      const { data } = await api.get('/chartofaccounts')
      const gridDataValues = data.map(({ id, code, name }) => {
        return { show: true, id, fields: [code, name, code.substring(0, 2) === '01' ? 'Receipts' : 'Expenses'] }
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
      <Breadcrumbs currentPage={currentPage} />
      <FiltersBar>
        <Filter size={14} /> Custom Filters
      </FiltersBar>
    </PageHeader>
    <Filters access={hasAccessTo(accesses, currentPage.alias)} handleNew={() => setOpened('new')} search handleFilters={handleFilters} gridHeader={gridHeader} gridData={gridData} setGridHeader={setGridHeader} activeFilters={activeFilters} />

    <Grid gridData={gridData} gridHeader={gridHeader} orderBy={orderBy} setOrderBy={setOrderBy} handleOpened={handleOpened} opened={opened}>
      {opened && <div className='fixed left-0 top-0 z-40 w-full h-full' style={{ background: 'rgba(0,0,0,.2)' }}></div>}
      {opened && <PagePreview access={hasAccessTo(accesses, currentPage.alias)} id={opened} handleOpened={handleOpened} setOpened={setOpened} defaultFormType='full' />}
    </Grid>
  </div>;
}
