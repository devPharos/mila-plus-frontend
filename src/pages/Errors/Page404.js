import React from 'react';
import Breadcrumbs from '~/components/Breadcrumbs';
import PageHeader from '~/components/PageHeader';
import { getCurrentPage } from '~/functions';

export default function Page404() {
    const currentPage = getCurrentPage();

    return <div className='h-full bg-white flex flex-1 flex-col justify-between items-start rounded-tr-2xl px-4'>
        <PageHeader>
            {currentPage && <Breadcrumbs currentPage={currentPage} />}
        </PageHeader>

        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'start', paddingTop: 24 }}>
            <div>
                <h1 className='p-2 text-2xl text-gray-500'>Oops!</h1>
                <h2 className='p-2 text-lg text-gray-500'>We can&apos;t seem to find the page you&apos;re looking for.</h2>
            </div>
        </div>
    </div>;
}
