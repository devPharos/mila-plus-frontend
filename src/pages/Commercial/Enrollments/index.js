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
import { format } from 'date-fns';

export default function Enrollments() {
  const [activeFilters, setActiveFilters] = useState([])
  const [opened, setOpened] = useState(false)
  const [orderBy, setOrderBy] = useState({ column: 'Name', asc: true })
  const accesses = useSelector(state => state.auth.accesses);
  const filial = useSelector(state => state.auth.filial);
  const currentPage = getCurrentPage();
  const [gridHeader, setGridHeader] = useState([
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
        const { name, type, sub_status } = students;
        const { phase, phase_step, created_at: stepCreatedAt, step_status, expected_date } = enrollmenttimelines[enrollmenttimelines.length - 1];
        const ret = { show: true, id, fields: [name, type, sub_status, phase, phase_step, format(stepCreatedAt, 'MM/dd/yyyy @ HH:mm'), step_status, expected_date], canceled: canceled_at }
        return ret
      })
      setGridData(gridDataValues)
    }
    getData()
  }, [opened, filial])

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
    <Filters access={hasAccessTo(accesses, currentPage.alias)} handleNew={null} search handleFilters={handleFilters} gridHeader={gridHeader} gridData={gridData} setGridHeader={setGridHeader} activeFilters={activeFilters} />

    <Grid gridData={gridData} gridHeader={gridHeader} orderBy={orderBy} setOrderBy={setOrderBy} handleOpened={handleOpened} opened={opened}>
      {opened && <div className='fixed left-0 top-0 z-40 w-full h-full' style={{ background: 'rgba(0,0,0,.2)' }}></div>}
      {opened && <PagePreview access={hasAccessTo(accesses, currentPage.alias)} id={opened} handleOpened={handleOpened} setOpened={setOpened} defaultFormType='full' />}
    </Grid>
  </div>;
}
