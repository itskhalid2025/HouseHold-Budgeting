import React, { createContext, useState, useContext } from 'react';

const SmartEntryContext = createContext();

export function SmartEntryProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const openSmartEntry = () => setIsOpen(true);
    const closeSmartEntry = () => setIsOpen(false);

    return (
        <SmartEntryContext.Provider value={{ isOpen, openSmartEntry, closeSmartEntry }}>
            {children}
        </SmartEntryContext.Provider>
    );
}

export function useSmartEntry() {
    return useContext(SmartEntryContext);
}
