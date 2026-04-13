import React, {PropsWithChildren} from 'react';

const PSHighlightMessageAfterScroll = React.createContext<number | undefined>(
  undefined,
);

const PSSetHighlightMessageAfterScroll = React.createContext<
  React.Dispatch<React.SetStateAction<number | undefined>>
>(() => undefined);

export const PSHighlightMessageAfterScrollProvider = ({
  children,
}: PropsWithChildren) => {
  const [messageId, setMessageId] = React.useState<number | undefined>(
    undefined,
  );

  return (
    <PSHighlightMessageAfterScroll.Provider value={messageId}>
      <PSSetHighlightMessageAfterScroll.Provider value={setMessageId}>
        {children}
      </PSSetHighlightMessageAfterScroll.Provider>
    </PSHighlightMessageAfterScroll.Provider>
  );
};

export const usePSHighlightMessageAfterScroll = () =>
  React.useContext(PSHighlightMessageAfterScroll);

export const useSetPSHighlightMessageAfterScroll = () =>
  React.useContext(PSSetHighlightMessageAfterScroll);
