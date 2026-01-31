import React, { useState, useEffect } from 'react';

const PDFViewerModal = ({ isOpen, onClose, pdfUrl, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl animate-scale-in">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{title || 'Document Viewer'}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 relative overflow-hidden">
                    {pdfUrl ? (
                        <iframe
                            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-full"
                            title={title}
                            onContextMenu={(e) => e.preventDefault()}
                        ></iframe>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No document source provided.
                        </div>
                    )}
                </div>

                {/* Footer (Security Warning/Watermark) */}
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">Protected Content • Do Not Distribute</p>
                </div>
            </div>
        </div>
    );
};

export default PDFViewerModal;
