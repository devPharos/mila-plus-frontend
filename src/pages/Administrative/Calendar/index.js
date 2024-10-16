import 'rsuite/Calendar/styles/index.css';
import React, { createContext, useEffect, useState } from 'react';
import Breadcrumbs from '~/components/Breadcrumbs';
import api from '~/services/api';
import { getCurrentPage, hasAccessTo } from '~/functions';
import { useSelector } from 'react-redux';
import PageHeader from '~/components/PageHeader';
import { Badge, Calendar } from 'rsuite';
import { format, parseISO } from 'date-fns'
import SelectPopover from '~/components/RegisterForm/SelectPopover';
import { Form } from '@unform/web';
import PagePreview from './Preview';
import Icon from '~/components/Icon';
import { PreviewContext } from '~/pages/Commercial/Enrollments';
import PreviewController from '~/components/PreviewController';

export const InputContext = createContext({})

export default function AdministrativeCalendar() {
  const filial = useSelector(state => state.auth.filial);
  const currentPage = getCurrentPage();
  const [date, setDate] = useState(new Date())
  const [successfullyUpdated, setSuccessfullyUpdated] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [opened, setOpened] = useState(false)
  const accesses = useSelector(state => state.auth.accesses);
  const [freeDays, setFreeDays] = useState([])

  useEffect(() => {

    async function getData() {
      const { data } = await api.get(`/calendar-days`)
      setFreeDays(data.filter(freeDay => freeDay.day.substring(0, 4) == year && freeDay.type == 'Administrative'))
    }
    getData()
  }, [filial, year, opened])

  const yearsOptions = [{ label: '2025', value: '2025' }, { label: '2024', value: '2024' }, { label: '2023', value: '2023' }]

  function getTodoList(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().padStart(4, '0');

    return freeDays.filter(freeDay => {
      if (freeDay.dayto) {
        if (`${year}-${month}-${day}` >= freeDay.day && `${year}-${month}-${day}` <= freeDay.dayto) {
          return freeDays.filter(freeDay => freeDay.day.substring(5, 10) == `${month}/${day}`)
        }
      } else {
        if (`${year}-${month}-${day}` == freeDay.day) {
          return freeDays.filter(freeDay => freeDay.day.substring(5, 10) == `${month}/${day}`)
        }
      }
    })
  }

  function renderCell(date) {
    const list = getTodoList(date);

    if (list.length) {
      return list.map(item => <Badge className={`w-full ${item.type == 'Academic' ? 'bg-yellow-100' : 'bg-green-100'} text-xs text-zinc-500`} content={item.title} />)
    }

    return null;
  }

  function handleOpened(id) {
    if (!id) {
      setSuccessfullyUpdated(true)
    }
    setOpened(id)
  }

  useEffect(() => {
    if (date && year) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');

      setDate(parseISO(`${year}-${month}-${day}`))
    }
  }, [year])

  function handleSelect(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().padStart(4, '0');
    const founded = freeDays.filter(freeDay => {
      if (freeDay.dayto) {
        if (`${year}-${month}-${day}` >= freeDay.day && `${year}-${month}-${day}` <= freeDay.dayto) {
          return freeDays.filter(freeDay => freeDay.day.substring(5, 10) == `${month}/${day}`)
        }
      } else {
        if (`${year}-${month}-${day}` == freeDay.day) {
          return freeDays.filter(freeDay => freeDay.day.substring(5, 10) == `${month}/${day}`)
        }
      }
    })
    if (founded.length == 0) {
      setOpened(null)
      return
    }
    setOpened(founded[0].id)
  }

  return <div className='h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4'>
    <PageHeader>
      <Breadcrumbs currentPage={currentPage} />
    </PageHeader>

    <div className='relative flex flex-1 flex-row justify-between items-start rounded-tr-2xl px-4'>
      <Calendar value={date} onSelect={handleSelect} onChange={setDate} renderCell={renderCell} bordered cellClassName={date => (date.getDay() % 2 ? 'bg-zinc-50' : undefined)} />

      <div className='flex w-full min-w-44 flex-col items-center justify-center pt-2 pb-2'>
        <Form className='w-full'>
          <InputContext.Provider value={{ setSuccessfullyUpdated, successfullyUpdated }}>
            <SelectPopover onChange={(year) => setYear(year.value)} name='year' options={yearsOptions} defaultValue={yearsOptions[1]} InputContext={InputContext} />
            <button type='button' onClick={() => handleOpened('new')} className='w-full bg-mila_orange text-white rounded-md py-6 my-2 px-2 h-6 flex flex-row items-center justify-center text-xs gap-1'>
              <Icon name='Plus' size={16} /> <strong>Free Day</strong>
            </button>
          </InputContext.Provider>
        </Form>
        {freeDays.map((freeDay, index) =>
          <button type='button' key={index} onClick={() => setDate(parseISO(freeDay.date))} className={`w-48 text-xs text-center text-zinc-500 py-1 px-2 my-1 ${freeDay.type == 'Academic' ? 'bg-yellow-100' : 'bg-green-100'} transition hover:bg-zinc-500 hover:text-white rounded-md`}>
            <strong>{format(parseISO(freeDay.day), 'MMM, do')} {freeDay.dayto ? `- ${format(parseISO(freeDay.dayto), 'MMM, do')}` : ''}</strong>
            <div>{freeDay.title}</div>
          </button>
        )}
      </div>

      {opened && <div className='fixed left-0 top-0 z-40 w-full h-full' style={{ background: 'rgba(0,0,0,.2)' }}></div>}
      {opened && <PreviewContext.Provider value={{ successfullyUpdated, handleOpened }}>
        <PreviewController>
          <PagePreview access={hasAccessTo(accesses, currentPage.alias)} id={opened} handleOpened={handleOpened} setOpened={setOpened} defaultFormType='full' successfullyUpdated={successfullyUpdated} setSuccessfullyUpdated={setSuccessfullyUpdated} />
        </PreviewController>
      </PreviewContext.Provider>}
    </div>

  </div>;
}
