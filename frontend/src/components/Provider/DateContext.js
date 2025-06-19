import React, {createContext, useContext, useState} from "react";

const DateContext = createContext();

export const DateProvider = ({children}) => {
    const [dateField, setDateField] = useState([]);

    return(
        <DateContext.Provider value={{dateField, setDateField}}>
            {children}
        </DateContext.Provider>
    );
};

export const useDateField = () => useContext(DateContext);