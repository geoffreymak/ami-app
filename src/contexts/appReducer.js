import * as types from "./actionsType";

import { storeObjectData } from "../utils/storage";
import * as constValue from "../utils/const";

export const initialState = {
  isLoading: true,
  songs: null,
  favoris: null,
};

export default (state, action) => {
  switch (action.type) {
    case types.SET_STATE:
      return {
        ...state,
        ...action.payload,
      };

    case types.ADD_FAVORIS:
      const favorisId = action.payload.id;
      let newFavoris = null;

      if (!!state.favoris) {
        newFavoris = [...state.favoris, favorisId];
      } else {
        newFavoris = [favorisId];
      }
      storeObjectData(constValue.FAVORIS_STORE_KEY, newFavoris);
      return {
        ...state,
        favoris: newFavoris,
      };

    case types.REMOVE_FAVORIS:
      const favId = action.payload.id;
      let cleanedFavoris = null;
      if (!!state.favoris) {
        cleanedFavoris = state.favoris.filter((fId) => fId !== favId);
      } else {
        cleanedFavoris = state.favoris;
      }
      storeObjectData(constValue.FAVORIS_STORE_KEY, cleanedFavoris);
      return {
        ...state,
        favoris: cleanedFavoris,
      };

    default:
      break;
  }
};
