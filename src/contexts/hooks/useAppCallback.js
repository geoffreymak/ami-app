import { useCallback } from "react";
import * as types from "../actionsType";
import data from "../../data/data.json";

import { getObjectData } from "../../utils/storage";
import * as constValue from "../../utils/const";

const useAppCallback = (state, dispatch) => {
  const initializeData = useCallback(async () => {
    if (!state.songs) {
      dispatch({ type: types.SET_STATE, payload: { songs: data } });
    }

    if (!state.favoris) {
      const favoris = await getObjectData(constValue.FAVORIS_STORE_KEY);
      if (!!favoris) {
        dispatch({ type: types.SET_STATE, payload: { favoris: favoris } });
      } else {
        dispatch({ type: types.SET_STATE, payload: { favoris: [] } });
      }
      console.log("favoris", favoris);
    }

    if (state.isLoading) {
      dispatch({ type: types.SET_STATE, payload: { isLoading: false } });
    }
  }, [state.songs, state.favoris, state.isLoading]);

  const isFavoris = useCallback(
    (id) => {
      if (!id) return;
      if (!!state.favoris) {
        return !!state.favoris.find((fId) => fId === id);
      }
      return false;
    },
    [state.favoris]
  );

  const toggleToFavoris = useCallback(
    (id) => {
      if (!id) return;
      let actionType = isFavoris(id) ? types.REMOVE_FAVORIS : types.ADD_FAVORIS;
      console.log(actionType);
      dispatch({ type: actionType, payload: { id } });
    },
    [isFavoris]
  );

  return {
    initializeData,
    toggleToFavoris,
    isFavoris,
  };
};

export default useAppCallback;
