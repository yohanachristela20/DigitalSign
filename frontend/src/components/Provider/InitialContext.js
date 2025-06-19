import React, {createContext, useContext, useState} from "react";

const InitialContext = createContext();

export const InitialProvider = ({children}) => {
    const [initials, setInitials] = useState([]);

    return(
        <InitialContext.Provider value={{initials, setInitials}}>
            {children}
        </InitialContext.Provider>
    );
};

export const useInitial = () => useContext(InitialContext);