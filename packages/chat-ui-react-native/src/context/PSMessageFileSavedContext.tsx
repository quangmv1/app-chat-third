import cloneDeep from 'lodash.clonedeep';
import React, {PropsWithChildren} from 'react';
import {PSMessageFileSavedEntity} from '../types';
import {
  downloadFile,
  isExistFile,
  downloadImageOrVideo,
  psLogger,
  DownloadProgressData,
} from '../utils';
import {useRealm} from './PSRealmContext';
import {useDeepCompareMemoize, useIsMountedRef} from '../hooks';

type PSMessageFileSavedDownloadProgressContextValue = {
  downloadProgress: Record<string, number>;
};

const PSMessageFileSavedDownloadProgressContext = React.createContext(
  {} as PSMessageFileSavedDownloadProgressContextValue,
);

type PSMessageFileSavedContextValue = {
  downloadMessageFile: (
    fileId: string,
    url: string,
    fileName: string,
  ) => Promise<void>;
  getPathFromFileId: (fileId: string) => string | undefined;
  isMessageFileExisted: (fileId: string) => Promise<boolean>;
  downLoadMessageMedia: (url: string) => Promise<void>;
};

const PSMessageFileSavedContext = React.createContext(
  {} as PSMessageFileSavedContextValue,
);

export const PSMessageFileSavedProvider = ({children}: PropsWithChildren) => {
  const realm = useRealm();
  const [downloadProgress, setDownloadProgress] = React.useState<
    Record<string, number>
  >({});

  const isMounted = useIsMountedRef();

  const downloadMessageFile = React.useCallback(
    async (fileId: string, url: string, fileName: string) => {
      const handleDownLoadProgress = (progressEvent: DownloadProgressData) => {
        let percentCompleted = Math.round(
          (progressEvent.bytesWritten * 100) / progressEvent.contentLength,
        );
        psLogger.error(`percentCompleted = ${percentCompleted}`);

        if (isMounted.current) {
          setDownloadProgress(prev => {
            if (fileId) {
              const percent = prev[fileId];
              // 5% 1 lần thì mới fire event
              if (
                percent &&
                percentCompleted < 100 &&
                (percent === 100 || percentCompleted - percent < 5)
              ) {
                return prev;
              } else {
                const newRecord = cloneDeep(prev);
                newRecord[fileId] = Math.min(percentCompleted, 100);
                return newRecord;
              }
            } else {
              return prev;
            }
          });
        }
      };

      // bắt đầu download set luôn 1% để UI thay đổi
      setDownloadProgress(prev => {
        const newRecord = cloneDeep(prev);
        newRecord[fileId] = 1;
        return newRecord;
      });
      const filePathSaved = await downloadFile(
        url,
        fileName,
        handleDownLoadProgress,
      );
      if (isMounted.current) {
        // file size quá bé sẽ ko nhận đc callback
        // nên để đảm bảo vẫn set lại 100
        setDownloadProgress(prev => {
          const newRecord = cloneDeep(prev);
          newRecord[fileId] = 100;
          return newRecord;
        });
        // download thành công thì update relation in PSMessageFileSavedEntity
        if (filePathSaved) {
          try {
            realm.write(() => {
              PSMessageFileSavedEntity.createOrUpdate(realm, {
                fileId: fileId,
                filePathSaved: filePathSaved,
              } as PSMessageFileSavedEntity);
            });
          } catch (error) {
            psLogger.error(
              'PSMessageFileSavedProvider: downloaded and save to PSMessageFileSavedEntity',
              error,
            );
          }
        }

        // đảm bảo read ngay sau khi write trả về kết quả đúng
        await new Promise(resolver =>
          setTimeout(() => {
            resolver('');
          }, 500),
        );
      }
    },
    [realm],
  );

  const getPathFromFileId = React.useCallback(
    (fileId: string) => {
      const result = PSMessageFileSavedEntity.getFirstById(realm, fileId);
      return result?.filePathSaved;
    },
    [realm],
  );

  const isMessageFileExisted = React.useCallback(
    async (fileId: string) => {
      const result = getPathFromFileId(fileId);
      if (result) {
        try {
          return await isExistFile(result);
        } catch (error) {
          psLogger.error(
            'PSMessageFileSavedProvider: isMessageFileExisted',
            error,
          );
          return false;
        }
      }
      return false;
    },
    [getPathFromFileId],
  );

  const downLoadMessageMedia = React.useCallback(async (url: string) => {
    await downloadImageOrVideo(url);
  }, []);

  const mediaFileContextValue = React.useMemo<PSMessageFileSavedContextValue>(
    () => ({
      downloadMessageFile: downloadMessageFile,
      getPathFromFileId: getPathFromFileId,
      isMessageFileExisted: isMessageFileExisted,
      downLoadMessageMedia: downLoadMessageMedia,
    }),
    [
      downloadMessageFile,
      getPathFromFileId,
      isMessageFileExisted,
      downLoadMessageMedia,
    ],
  );

  const downloadProgressContextValue =
    React.useMemo<PSMessageFileSavedDownloadProgressContextValue>(
      () =>
        ({
          downloadProgress: downloadProgress,
        }) as PSMessageFileSavedDownloadProgressContextValue,
      [useDeepCompareMemoize(downloadProgress)],
    );

  return (
    <PSMessageFileSavedContext.Provider value={mediaFileContextValue}>
      <PSMessageFileSavedDownloadProgressContext.Provider
        value={downloadProgressContextValue}>
        {children}
      </PSMessageFileSavedDownloadProgressContext.Provider>
    </PSMessageFileSavedContext.Provider>
  );
};

export const usePSMessageFileSavedContext = () =>
  React.useContext(PSMessageFileSavedContext);

export const usePSMessageFileSavedDownloadProgressContext = () =>
  React.useContext(PSMessageFileSavedDownloadProgressContext);
