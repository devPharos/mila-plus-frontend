import { Filter, History } from 'lucide-react';
import React, { createContext, useEffect, useState } from 'react';
import Breadcrumbs from '~/components/Breadcrumbs';
import Filters from '~/components/Filters';
import FiltersBar from '~/components/FiltersBar';
import Grid from '~/components/Grid';
import api from '~/services/api';
import { applyFilters, getCurrentPage, hasAccessTo } from '~/functions';
import PagePreview from './Preview';
import { useSelector } from 'react-redux';
import PageHeader from '~/components/PageHeader';
import { format, parseISO } from 'date-fns';
import PreviewController from '~/components/PreviewController';

export const PreviewContext = createContext({})

export default function Enrollments() {
  const [activeFilters, setActiveFilters] = useState([])
  const [opened, setOpened] = useState(false)
  const [orderBy, setOrderBy] = useState({ column: 'Name', asc: true })
  const accesses = useSelector(state => state.auth.accesses);
  const filial = useSelector(state => state.auth.filial);
  const currentPage = getCurrentPage();
  const [refresh, setRefresh] = useState(true)
  const [gridHeader, setGridHeader] = useState([
    {
      title: 'Enroll. Start',
      type: 'text',
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
      filter: false,
    },
    {
      title: 'Sub Status',
      type: 'text',
      filter: false,
    },
    {
      title: 'Phase',
      type: 'text',
      filter: false,
    },
    {
      title: 'Phase Step',
      type: 'text',
      filter: true,
    },
    {
      title: 'Step Date',
      type: 'text',
      filter: true,
    },
    {
      title: 'Step Status',
      type: 'text',
      filter: false,
    },
    {
      title: 'Expected Date',
      type: 'text',
      filter: true,
    },
  ])
  const [successfullyUpdated, setSuccessfullyUpdated] = useState(true)

  const [gridData, setGridData] = useState()

  function handleFilters({ title = '', value = '' }) {
    if (value) {
      setActiveFilters([...activeFilters.filter(el => el.title != title), { title, value }])
    } else {
      setActiveFilters([...activeFilters.filter(el => el.title != title)])
    }
  }

  useEffect(() => {

    async function getData() {
      const { data } = await api.get(`/enrollments`)
      const gridDataValues = data.map(({ id, students, enrollmenttimelines, canceled_at }) => {
        const { name, processtypes, processsubstatuses } = students;
        const type = processtypes ? processtypes.name : '';
        const sub_status = processsubstatuses ? processsubstatuses.name : '';
        const { phase, phase_step, created_at: stepCreatedAt, step_status, expected_date } = enrollmenttimelines[enrollmenttimelines.length - 1];
        const exptected = expected_date ? format(parseISO(expected_date), 'MM/dd/yyyy') : '-'
        const enroll_start = enrollmenttimelines.length > 0 ? format(parseISO(enrollmenttimelines[0].created_at), 'MM/dd/yyyy') : '-';
        const ret = { show: true, id, fields: [enroll_start, name, type, sub_status, phase, phase_step, format(stepCreatedAt, 'MM/dd/yyyy @ HH:mm'), step_status, expected_date && expected_date <= format(new Date(), 'yyyyMMdd') ? <div className='flex flex-row gap-2 items-center text-red-500'>{exptected} <History size={12} color='#f00' /></div> : exptected], canceled: canceled_at }
        return ret
      })
      setRefresh(false)
      setGridData(gridDataValues)
    }
    if (!opened && filial && refresh) {
      getData()
    }
  }, [opened, filial, refresh])

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

  return <div className='h-full bg-white flex flex-1 flex-col justify-between items-start rounded-tr-2xl px-4'>
    <PageHeader>
      <Breadcrumbs currentPage={currentPage} />
      <FiltersBar>
        <Filter size={14} /> Custom Filters
      </FiltersBar>
    </PageHeader>
    <Filters access={hasAccessTo(accesses, currentPage.alias)} handleNew={null} search handleFilters={handleFilters} gridHeader={gridHeader} gridData={gridData} setGridHeader={setGridHeader} activeFilters={activeFilters} />

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
