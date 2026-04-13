import React, {PropsWithChildren} from 'react';
import {PSTranslator, PSi18n} from '../translations';
import {useIsMountedRef} from '../hooks';

export type TranslatorFunctions = {
  translator: PSTranslator;
};

type PSTranslationContextValue = {
  translator: PSTranslator;
};

const PSTranslationContext = React.createContext<PSTranslationContextValue>(
  {} as PSTranslationContextValue,
);

export const PSTranslationProvider = ({
  i18n,
  children,
}: PropsWithChildren<{i18n?: PSi18n}>) => {
  const isMounted = useIsMountedRef();

  const [t, setTranslator] = React.useState<TranslatorFunctions>({
    translator: (key: string) => key,
  });

  React.useEffect(() => {
    let psi18n: PSi18n;

    if (i18n) {
      psi18n = i18n;
    } else {
      psi18n = new PSi18n();
    }

    const {unsubscribe} = psi18n.addOnLanguageChangeListener(translator => {
      setTranslator({translator: translator});
    });

    psi18n.getTranslator().then(translator => {
      if (translator && isMounted.current) {
        setTranslator({translator: translator});
      }
    });

    return () => {
      unsubscribe();
    };
  }, [i18n]);

  const contextValue = React.useMemo(() => {
    return {
      translator: t.translator,
    } as PSTranslationContextValue;
  }, [t]);

  return (
    <PSTranslationContext.Provider value={contextValue}>
      {children}
    </PSTranslationContext.Provider>
  );
};

export const usePSTranslationContext = () =>
  React.useContext(PSTranslationContext);
