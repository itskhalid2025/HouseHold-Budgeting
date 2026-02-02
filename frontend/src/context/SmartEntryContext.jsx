import React, { createContext, useState, useContext } from 'react';

const SmartEntryContext = createContext();

export function SmartEntryProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const [smartEntryOptions, setSmartEntryOptions] = useState(null); // { mode: 'image', files: FileList }

    const openSmartEntry = (options = null) => {
        setSmartEntryOptions(options);
        setIsOpen(true);
    };
    const closeSmartEntry = () => {
        setIsOpen(false);
        setSmartEntryOptions(null);
    };

    return (
        <SmartEntryContext.Provider value={{ isOpen, openSmartEntry, closeSmartEntry, smartEntryOptions }}>
            {children}
        </SmartEntryContext.Provider>
    );
}

export function useSmartEntry() {
    return useContext(SmartEntryContext);
}
