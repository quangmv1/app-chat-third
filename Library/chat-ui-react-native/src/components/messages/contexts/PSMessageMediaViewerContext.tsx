import React, {createContext, useCallback, useContext, useState} from 'react';
import {ActivityIndicator, Modal} from 'react-native';
import {PSMessageMediaModel} from '../../../types';
import {PSMediaViewer} from '../../media-viewer';

const mapPSMessageMediaModelToMediaInfo = (media: PSMessageMediaModel) => {
  return {
    url: media.srcUrl,
    width: media.width,
    height: media.height,
    type: media.type,
    name: media.name,
  };
};

const PSMessageMediaViewerContext = createContext<
  (index: number, images: PSMessageMediaModel[]) => void
>(() => undefined);

export const PSMessageMediaViewerProvider = (
  props: React.PropsWithChildren,
) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [media, setMedia] = useState<PSMessageMediaModel[]>();

  const toggleModal = useCallback(() => {
    if (isModalVisible) {
      setMedia(undefined);
    }
    setModalVisible(!isModalVisible);
  }, [isModalVisible]);

  const show = useCallback((_index: number, _media: PSMessageMediaModel[]) => {
    setModalVisible(true);
    setIndex(_index);
    setMedia(_media);
  }, []);

  const loadingRender = useCallback(() => {
    return <ActivityIndicator size="large" />;
  }, []);

  return (
    <PSMessageMediaViewerContext.Provider value={show}>
      {props.children}
      <Modal
        visible={isModalVisible}
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={toggleModal}>
        <PSMediaViewer
          mediaUrls={media?.map(item =>
            mapPSMessageMediaModelToMediaInfo(item),
          )}
          index={index}
          onSwipeDown={toggleModal}
          enableSwipeDown={true}
          swipeDownThreshold={130}
          loadingRender={loadingRender}
        />
      </Modal>
    </PSMessageMediaViewerContext.Provider>
  );
};

export const usePSMessageMediaViewerContext = () =>
  useContext(PSMessageMediaViewerContext);
