import React, { useState, useRef, useEffect } from 'react';
import { UI_LABELS } from '../constants';

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
);

const ClipboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </svg>
);

const GoogleDriveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.152 6.393l-6.289-3.623a2.493 2.493 0 00-2.493 0L4.12 6.393A2.488 2.488 0 002.88 8.5v7c0 .991.583 1.868 1.455 2.273l6.288 3.623a2.492 2.492 0 002.493 0l6.289-3.623A2.488 2.488 0 0020.88 15.5v-7c0-.99-.583-1.868-1.455-2.273l.727-1.26zM8.88 15.5l-3-5.18h6l3 5.18H8.88zm4.832-6.18h-9.4l4.7-8.12 4.7 8.12z" />
    </svg>
);


interface ShareOptionsProps {
    analysisText: string;
}

const ShareOptions: React.FC<ShareOptionsProps> = ({ analysisText }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(analysisText).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
            }, 1500);
        });
    };

    return (
        <div ref={wrapperRef} className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-cyan-400 transition"
                aria-label={UI_LABELS.SHARE_ANALYSIS}
                title={UI_LABELS.SHARE_ANALYSIS}
            >
                <ShareIcon />
            </button>

            {isOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-48 bg-gray-700 rounded-lg shadow-xl z-10">
                    <ul className="p-2 text-sm text-gray-200">
                        <li>
                            <button
                                onClick={handleCopyToClipboard}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-600 transition"
                            >
                                <ClipboardIcon />
                                <span>{copied ? UI_LABELS.COPIED_SUCCESS : UI_LABELS.COPY_TEXT}</span>
                            </button>
                        </li>
                        <li className="relative group">
                           <button
                                disabled
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-not-allowed opacity-50"
                           >
                                <GoogleDriveIcon />
                                <span>{UI_LABELS.SAVE_TO_DRIVE}</span>
                           </button>
                           <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-xs rounded-md invisible group-hover:visible">
                                {UI_LABELS.FEATURE_COMING_SOON}
                           </span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ShareOptions;
