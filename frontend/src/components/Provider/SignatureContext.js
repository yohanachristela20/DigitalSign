import React, {createContext, useContext, useState} from "react";

const SignatureContext = createContext();

export const SignatureProvider = ({children}) => {
    const [showSignature, setShowSignature] = useState(false);
    const [signatures, setSignatures] = useState([]);
    

    return(
        <SignatureContext.Provider value={{signatures, setSignatures}}>
            {children}
        </SignatureContext.Provider>
    );
};

export const useSignature = () => useContext(SignatureContext);