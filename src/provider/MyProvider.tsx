import { createContext, useState, ReactNode, FC } from "react";

interface MessageContextType {
  value: string;
  setValue: (newValue: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

interface MyProviderProps {
  children: ReactNode;
}

const MyProvider: FC<MyProviderProps> = ({ children }) => {
  const [value, setValue] = useState<string>("");
  return (
    <MessageContext.Provider value={{ value, setValue }}>
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MyProvider };
