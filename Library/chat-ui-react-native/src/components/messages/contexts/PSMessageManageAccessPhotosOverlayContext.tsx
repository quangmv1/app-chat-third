import React, {createContext, useCallback, useContext, useState} from 'react';
import {PSMessageManageAccessPhotos} from '../components';

const PSMessageManageAccessPhotosOverlayContext = createContext<() => void>(
  () => undefined,
);

export const PSMessageManageAccessPhotosOverlayProvider = (
  props: React.PropsWithChildren,
) => {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = useCallback(() => {
    setModalVisible(!isModalVisible);
  }, [isModalVisible]);

  const show = useCallback(() => {
    setModalVisible(true);
  }, []);

  return (
    <PSMessageManageAccessPhotosOverlayContext.Provider value={show}>
      {props.children}
      {isModalVisible && (
        <PSMessageManageAccessPhotos
          isVisible={isModalVisible}
          toggleModal={toggleModal}
        />
      )}
    </PSMessageManageAccessPhotosOverlayContext.Provider>
  );
};

export const usePSMessageManageAccessPhotosOverlayContext = () =>
  useContext(PSMessageManageAccessPhotosOverlayContext);
