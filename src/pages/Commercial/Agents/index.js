import { Filter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Breadcrumbs from '~/components/Breadcrumbs';
import Filters from '~/components/Filters';
import FiltersBar from '~/components/FiltersBar';
import Grid from '~/components/Grid';
import api from '~/services/api';
import { applyFilters, getCurrentPage, hasAccessTo } from '~/functions';
import PagePreview from './Preview';
import { useSelector } from 'react-redux';
import PageHeader from '~/components/PageHeader';
import PreviewController from '~/components/PreviewController';
import { PreviewContext } from '~/pages/Commercial/Enrollments';

export default function AdministrativeAgents() {
  const [activeFilters, setActiveFilters] = useState([])
  const [opened, setOpened] = useState(false)
  const [orderBy, setOrderBy] = useState({ column: 'Name', asc: true })
  const [successfullyUpdated, setSuccessfullyUpdated] = useState(true)
  const accesses = useSelector(state => state.auth.accesses);
  const filial = useSelector(state => state.auth.filial);
  const currentPage = getCurrentPage();
  const [gridHeader, setGridHeader] = useState([
    {
      title: 'Name',
      type: 'text',
      filter: false,
    },
    {
      title: 'E-mail',
      type: 'text',
      filter: false,
    },
  ])

  const [gridData, setGridData] = useState()

  function handleFilters({ title = '', value = '' }) {
    if (value) {
      setActiveFilters([...activeFilters.filter(el => el.title != title), { title, value }])
    } else {
      setActiveFilters([...activeFilters.filter(el => el.title != title)])
    }
  }

  useEffect(() => {
    if (!opened) {
      setSuccessfullyUpdated(true)
    }
  }, [opened])

  useEffect(() => {

    async function getData() {
      const { data } = await api.get(`/agents`)
      const gridDataValues = data.map(({ id, name, email, canceled_at }) => {
        const ret = { show: true, id, fields: [name, email], canceled: canceled_at }
        return ret
      })
      setGridData(gridDataValues)
    }
    getData()
  }, [opened, filial])

  function handleOpened(id) {
    if (!id) {
      setSuccessfullyUpdated(true)
    }
    setOpened(id)
  }

  useEffect(() => {
    if (gridData && gridHeader) {
      applyFilters(activeFilters, gridData, gridHeader, orderBy, setGridData)
    }
  }, [activeFilters, orderBy])

  return <div className='h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4'>
    <PageHeader>
      <Breadcrumbs currentPage={currentPage} />
      <FiltersBar>
        <Filter size={14} /> Custom Filters
      </FiltersBar>
    </PageHeader>
    <Filters access={hasAccessTo(accesses, currentPage.alias)} handleNew={() => setOpened('new')} search handleFilters={handleFilters} gridHeader={gridHeader} gridData={gridData} setGridHeader={setGridHeader} activeFilters={activeFilters} />

    <Grid gridData={gridData} gridHeader={gridHeader} orderBy={orderBy} setOrderBy={setOrderBy} handleOpened={handleOpened} opened={opened}>
      {opened && <div className='fixed left-0 top-0 z-40 w-full h-full' style={{ background: 'rgba(0,0,0,.2)' }}></div>}
      {opened && <PreviewContext.Provider value={{ successfullyUpdated, handleOpened }}>
        <PreviewController>
          <PagePreview access={hasAccessTo(accesses, currentPage.alias)} id={opened} handleOpened={handleOpened} setOpened={setOpened} defaultFormType='full' successfullyUpdated={successfullyUpdated} setSuccessfullyUpdated={setSuccessfullyUpdated} />
        </PreviewController>
      </PreviewContext.Provider>}
    </Grid>
  </div>;
}
