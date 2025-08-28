import {
  Download,
  RotateCcw,
  Scale,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { Document, Page } from "react-pdf";

// import { Container } from './styles';

function PDFViewer({
  file = null,
  download = false,
  height = 600,
  pageNumber = 1,
  onlyOnePage = false,
}) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(pageNumber);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const options = useMemo(() => {
    cMapUrl: "/cmaps/";
    standardFontDataUrl: "/standard_fonts/";
  }, []);
  const memorizedFile = useMemo(() => file, []);

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

  return (
    <div style={{ height: height }}>
      <Document
        file={memorizedFile}
        onLoadError={console.error}
        onLoadSuccess={onDocumentLoadSuccess}
        options={options}
        showToolbar={true}
        className="relative border rounded h-full w-full pt-6"
      >
        <Page
          pageNumber={page}
          height={height + scale * height}
          rotate={rotation}
          scale={scale}
          loading={
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ height, width: height * 0.71111 }}
            >
              Loading...
            </div>
          }
        />
        <div className="absolute top-0 w-full text-xs text-gray-500 bg-gray-100 py-2 px-4 z-30 flex flex-row justify-center items-center gap-4">
          {!onlyOnePage && (
            <div className="flex flex-1 flex-row justify-between items-center">
              {page > 1 ? (
                <SkipBack
                  size={16}
                  onClick={() => setPage(page - 1)}
                  className="cursor-pointer hover:text-black rounded-full text-center"
                />
              ) : (
                <div></div>
              )}
              <div>
                Page {page} of {numPages}
              </div>
              {page < numPages ? (
                <SkipForward
                  size={16}
                  onClick={() => setPage(page + 1)}
                  className="cursor-pointer hover:text-black rounded-full text-center"
                />
              ) : (
                <div></div>
              )}
            </div>
          )}
          {
            <div
              className="font-bold cursor-pointer flex flex-row gap-2 hover:text-black"
              onClick={() => setScale(scale + 0.1)}
            >
              <ZoomIn size={14} /> Zoom In
            </div>
          }
          {
            <div
              className="font-bold cursor-pointer flex flex-row gap-2 hover:text-black"
              onClick={() => setScale(scale - 0.1)}
            >
              <ZoomOut size={14} /> Zoom Out
            </div>
          }
          {
            <div
              className="font-bold cursor-pointer flex flex-row gap-2 hover:text-black"
              onClick={() => setRotation((rotation + 90) % 360)}
            >
              <RotateCcw size={14} /> Rotate
            </div>
          }
          {download && (
            <div
              className="font-bold cursor-pointer flex flex-row gap-2 hover:text-black"
              onClick={() => window.open(memorizedFile.url, "_blank")}
            >
              <Download size={14} /> Download
            </div>
          )}
        </div>
      </Document>
    </div>
  );
}

export default PDFViewer;
