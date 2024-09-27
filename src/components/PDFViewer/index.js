import { SkipBack, SkipForward } from 'lucide-react';
import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';

// import { Container } from './styles';

function PDFViewer({ file, height = 600 }) {
    const [numPages, setNumPages] = useState(0)
    const [page, setPage] = useState(1)

    function onDocumentLoadSuccess({ numPages: nextNumPages }) {
        setNumPages(nextNumPages)
    }

    return <div style={{ height: height }}>
        <Document file={file} onLoadError={console.error} onLoadSuccess={onDocumentLoadSuccess} options={{ cMapUrl: '/cmaps/', standardFontDataUrl: '/standard_fonts/' }} className='relative border rounded h-full w-full'>

            <Page pageNumber={page} height={height} loading={<div className='flex h-full w-full items-center justify-center' style={{ height, width: height * 0.71111 }}>Loading...</div>} />
            <div className='absolute bottom-0 w-full text-xs text-gray-500 bg-gray-100 py-2 px-4 z-30 flex flex-row justify-between items-center gap-4'>
                {page > 1 ? <SkipBack size={16} onClick={() => setPage(page - 1)} className='cursor-pointer hover:text-black rounded-full text-center' /> : <div></div>}
                <div>Page {page} of {numPages}</div>
                {page < numPages ? <SkipForward size={16} onClick={() => setPage(page + 1)} className='cursor-pointer hover:text-black rounded-full text-center' /> : <div></div>}

            </div>
        </Document>
    </div>;
}

export default PDFViewer;
