import { ArrowUpDown } from 'lucide-react';
import React, { useEffect } from 'react';
import Icon from '../Icon';

// import { Container } from './styles';

export default function Grid({ children, gridHeader = null, gridData = null, orderBy = null, setOrderBy = () => null, handleOpened = () => null, opened = null }) {
  if (!gridHeader || !gridData) {
    return null;
  }
  return <div className='relative flex flex-1 justify-start w-full h-screen overflow-y-scroll'>
    <table className="bg-secondary-50 rounded-xl p-4 w-full table-auto text-xs overflow-hidden text-left">
      <thead className='sticky top-0 border-md'>
        <tr className='bg-secondary h-8 sticky'>

          {/* <th className='px-4'>
            <div className='flex flex-row items-center gap-2'>Actions</div>
          </th> */}
          {gridHeader.length > 0 && gridHeader.map((head, index) => {
            return <th className='px-4' key={index}>
              <button type='button' onClick={() => setOrderBy({ column: head.title, asc: !orderBy.asc })} className={`flex flex-row items-center justify-between w-full ${orderBy.column === head.title && 'text-primary'}`}>
                <div className='flex flex-row items-center gap-2'>{head.title} {gridHeader[index].action && <Icon name={gridHeader[index].action.icon} size={12} />}</div>  {orderBy.column === head.title && <ArrowUpDown size={12} color='#0B2870' />}
              </button>
            </th>
          })}
        </tr>
      </thead>
      <tbody className='align-center'>
        {gridData.length > 0 ? gridData.map((row, index) => {
          return row.show && <tr key={index} onClick={() => handleOpened(row.id || null)} className={`${opened === row.id ? 'bg-mila_orange text-white' : row.canceled ? 'opacity-40' : 'odd:bg-white'} h-10  hover:rounded hover:border hover:border-mila_orange cursor-pointer`}>
            {
              row.fields.map((field, index) => {
                if (gridHeader[index].type === 'image') {
                  return <td className='px-4 w-10' key={index}><img src={field} width="30" className='rounded-md overflow-hidden' /></td>
                }
                if (gridHeader[index].type === 'boolean') {
                  return <td className={`px-4`} key={index}>
                    <div className={`flex flex-row items-center justify-start gap-2`}>
                      <span>{field ? 'Yes' : 'No'}</span>
                    </div>
                  </td>
                }
                return <td className={`px-4`} key={index}>
                  <div className={`flex flex-row items-center justify-start gap-2`}>
                    <span>{field}</span>
                  </div>
                </td>
              })
            }
          </tr>
        }) :
          <tr className={`bg-gray-50 text-gray-500 h-10`}>
            <td className='px-4 w-10' colSpan='100'>There&apos;s nothing here yet.</td>
          </tr>
        }
        <tr>
          <td></td>
        </tr>
      </tbody>
    </table>
    {children}
  </div>;
}
