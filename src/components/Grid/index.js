import { ArrowUpDown } from 'lucide-react';
import React from 'react';
import Icon from '../Icon';

// import { Container } from './styles';

export default function Grid({ children, gridHeader = null, gridData = null, orderBy = null, setOrderBy = () => null, handleOpened = () => null, opened = null }) {
  if(!gridHeader || !gridData) {
    return null;
  }
  return <div className='relative flex flex-1 w-full h-full'>
  <table className="bg-secondary-50 rounded-xl p-4 w-full table-auto text-xs overflow-hidden text-left">
    <thead>
      <tr className='bg-secondary h-8 sticky top-16'>

        <th className='px-4'>
            <div className='flex flex-row items-center gap-2'>Actions</div>
        </th>
        {gridHeader.length > 0 && gridHeader.map((head,index) => {
          return <th className='px-4' key={index}>
                <button type='button' onClick={() => setOrderBy({ column: head.title, asc: !orderBy.asc })} className={`flex flex-row items-center justify-between w-full ${orderBy.column === head.title && 'text-primary'}`}>
                    <div className='flex flex-row items-center gap-2'>{head.title} {gridHeader[index].action && <Icon name={gridHeader[index].action.icon} size={12} />}</div>  {orderBy.column === head.title && <ArrowUpDown size={12} color='#0B2870' /> }
                </button>
            </th>
        })}
      </tr>
    </thead>
    <tbody className='align-center'>
      {gridData.length > 0 && gridData.map((row,index) => {
        return row.show && <tr key={index} className='h-10 odd:bg-white'>
        <td className={`px-4`} key={index}>
            <div className={`flex flex-row items-center justify-start gap-2`}>
                <div onClick={() => handleOpened(row.id || null)} className='cursor-pointer underline flex flex-row items-center justify-between gap-2'><Icon name='Pencil' size={12} /> Edit</div> 
            </div>
        </td>
        {
        row.fields.map((field,index) => {
          if(gridHeader[index].type === 'image') {
            return <td className='px-4 w-10' key={index}><img src={field} width="30" className='rounded-md overflow-hidden' /></td>
          }
          return <td className={`px-4`} key={index}>
            <div className={`flex flex-row items-center justify-start gap-2`}>
                <span onClick={() => handleOpened(row.id || null)} className={`${gridHeader[index].action && 'cursor-pointer underline'}`}>{field}</span> 
            </div>
        </td>
        })
      }
      </tr>
      })}
      <tr>
        <td></td>
      </tr>
    </tbody>
  </table>
  {children}
</div>;
}
