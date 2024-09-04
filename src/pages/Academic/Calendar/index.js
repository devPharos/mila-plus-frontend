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
import Input from '~/components/RegisterForm/Input';
import InputLine from '~/components/RegisterForm/InputLine';
import DatePicker from '~/components/RegisterForm/DatePicker';
import PagePreview from './Preview';
import Icon from '~/components/Icon';
import Grid from '~/components/Grid';

export const InputContext = createContext({})

export default function AcademicCalendar() {
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
      setFreeDays(data.filter(freeDay => freeDay.day.substring(0, 4) == year))
    }
    getData()
  }, [filial, year, opened])

  const yearsOptions = [{ label: '2025', value: '2025' }, { label: '2024', value: '2024' }, { label: '2023', value: '2023' }]

  // const freeDays = [
  //   {
  //     day: '2025-01-15',
  //     type: 'Administrative',
  //     title: 'Martin Luther King Day'
  //   },
  //   {
  //     day: '2024-01-15',
  //     type: 'Administrative',
  //     title: 'Martin Luther King Day'
  //   },
  //   {
  //     day: '2024-01-01',
  //     dayto: '2024-01-07',
  //     type: 'Academic',
  //     title: 'Winter Break'
  //   },
  //   {
  //     day: '2024-02-19',
  //     type: 'Administrative',
  //     title: 'President\'s Day'
  //   },
  //   {
  //     day: '2024-03-18',
  //     dayto: '2024-03-23',
  //     type: 'Academic',
  //     title: 'Spring Break'
  //   },
  //   {
  //     day: '2024-05-27',
  //     type: 'Administrative',
  //     title: 'Memorial Day'
  //   },
  //   {
  //     day: '2024-06-19',
  //     type: 'Administrative',
  //     title: 'Juneteenth'
  //   },
  //   {
  //     day: '2024-07-04',
  //     type: 'Administrative',
  //     title: 'Independence Day'
  //   },
  //   {
  //     day: '2024-07-08',
  //     dayto: '2024-07-27',
  //     type: 'Academic',
  //     title: 'Summer Break'
  //   },
  //   {
  //     day: '2024-09-02',
  //     type: 'Administrative',
  //     title: 'Labor Day'
  //   },
  //   {
  //     day: '2024-10-10',
  //     type: 'Administrative',
  //     title: 'Columbus Day'
  //   },
  //   {
  //     day: '2024-11-11',
  //     type: 'Administrative',
  //     title: 'Veterans Day'
  //   },
  //   {
  //     day: '2024-11-27',
  //     type: 'Administrative',
  //     title: 'Thanksgiving'
  //   },
  //   {
  //     day: '2024-12-25',
  //     type: 'Administrative',
  //     title: 'Christmas'
  //   }
  // ].filter(freeDay => freeDay.date.substring(0, 4) == year)

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
        if (`${year}-${month}-${day}` >= freeDay.day && `${year}-${month}-${day}` <= freeDay.dayto && freeDay.type == 'Academic') {
          return freeDays.filter(freeDay => freeDay.day.substring(5, 10) == `${month}/${day}`)
        }
      } else {
        if (`${year}-${month}-${day}` == freeDay.day && freeDay.type == 'Academic') {
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

  return <div className='h-full bg-white flex flex-1 flex-col justify-between items-start rounded-tr-2xl px-4'>
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
      {opened && <PagePreview access={hasAccessTo(accesses, currentPage.alias)} id={opened} handleOpened={handleOpened} setOpened={setOpened} defaultFormType='preview' />}
    </div>

  </div>;
}
