import React, { useState } from 'react';
import Breadcrumbs from '~/components/Breadcrumbs';
import Filters from '~/components/Filters';
import FiltersBar from '~/components/FiltersBar';
import PageHeader from '~/components/PageHeader';

import { getCurrentPage } from '~/functions';

export default function CommercialDashboard() {
    // const [activeFilters, setActiveFilters] = useState([])
    const currentPage = getCurrentPage();
    // const [gridHeader, setGridHeader] = useState(null)

    return <div className='h-full bg-white flex flex-1 flex-col justify-between items-start rounded-tr-2xl px-4'>
        <PageHeader>
            <Breadcrumbs currentPage={currentPage} />
            <FiltersBar>
                {/* <Filter size={14} /> Custom Filters */}
            </FiltersBar>
        </PageHeader>
        {/* <Filters search handleFilters={handleFilters} gridHeader={gridHeader} gridData={gridData} setGridHeader={setGridHeader} activeFilters={activeFilters} /> */}

        {/* <Grid gridData={gridData} gridHeader={gridHeader} orderBy={orderBy} setOrderBy={setOrderBy} /> */}

        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'start', paddingTop: 24 }}>

        </div>
    </div>;
}
