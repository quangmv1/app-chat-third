import React, {PropsWithChildren} from 'react';
import {useQuery} from '../../../context';
import {PSThreadDraftEntity} from '../../../types';
import {processTextWithMentionFromBackEnd} from '../../PSRichText';

type PSThreadItemContextValue = {
  draftContent?: string;
};

const PSThreadItemContext = React.createContext<PSThreadItemContextValue>(
  {} as PSThreadItemContextValue,
);

export const PSThreadItemProvider = ({
  threadId,
  children,
}: PropsWithChildren<{threadId: string}>) => {
  const threadDraft = useQuery(
    PSThreadDraftEntity.name,
    results => results.filtered(PSThreadDraftEntity.filteredById(threadId)),
    [threadId],
  );

  const value = React.useMemo(() => {
    // @ts-ignore
    const content = threadDraft[0]?.draftContent?.trim?.() ?? '';
    // @ts-ignore
    const mentionIds = threadDraft[0]?.mentionIds ?? [];

    const value = processTextWithMentionFromBackEnd(content, mentionIds);

    return {
      draftContent: value.text,
    };
  }, [threadDraft]);

  return (
    <PSThreadItemContext.Provider value={value}>
      {children}
    </PSThreadItemContext.Provider>
  );
};

export const usePSThreadItemContext = () =>
  React.useContext(PSThreadItemContext);
