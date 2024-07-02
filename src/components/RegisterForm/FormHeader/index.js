import { format } from 'date-fns';
import { Blocks, CheckCheck, Eye, EyeOff, Save, Scaling, Trash, Trash2, X } from 'lucide-react';
import React, { useContext } from 'react';

// import { Container } from './styles';

export default function FormHeader({ title = '', registry, InputContext = null }) {
    const { registryBy, registryAt, registryStatus } = registry;
    const { id, fullscreen, setFullscreen, successfullyUpdated, handleCloseForm, handleInactivate, canceled } = useContext(InputContext)

    return <div className='relative bg-gray-100 h-24 mb-4 px-4 py-2 flex flex-row items-center justify-between w-full'>
        <h2 className='flex flex-col justify-start items-start gap-1' style={{ fontSize: 24 }}>{title} <span className='text-xs'>{registryAt && `${registryStatus} by ${registryBy} on ${format(registryAt, 'LLL do, yyyy @ HH:mm')}`}</span></h2>

        <div className='flex flex-row justify-between items-center gap-4'>
            <button type='button' onClick={() => setFullscreen(!fullscreen)} className='text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                <Scaling size={16} /> {fullscreen ? 'Minimize' : 'Full Screen'}
            </button>
            {/* <button type='button' onClick={() => handleInactivate()} className='text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                {canceled ? <><Eye size={16} /> Reactivate</> : <><EyeOff size={16} /> Inactivate</>}
            </button> */}
            <button type='button' onClick={() => handleCloseForm()} className='text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1'>
                <X size={16} /> {successfullyUpdated ? 'Close' : 'Discard changes not saved'}
            </button>
            <button type="submit" className={`text-md font-bold ${!successfullyUpdated ? 'bg-red-500' : 'bg-primary'} text-white rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1`}>
                {id === 'new' ? <><Save size={16} /> Create</> : !successfullyUpdated ? <><Save size={16} /> Save changes</> : <><CheckCheck size={16} /> Saved</>}
            </button>
        </div>
    </div>;
}
