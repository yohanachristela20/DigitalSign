import React, {createContext, useContext, useState} from "react";

const SignatureContext = createContext();

export const SignatureProvider = ({children}) => {
    const [showSignature, setShowSignature] = useState(false);

    return(
        <SignatureContext.Provider value={{showSignature, setShowSignature}}>
            {children}
        </SignatureContext.Provider>
    );
};

export const useSignature = () => useContext(SignatureContext);