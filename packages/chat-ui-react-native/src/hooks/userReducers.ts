export interface GetApiPagingState {
  loading: boolean;
  moreLoading: boolean;
  error: boolean;
  moreError: boolean;
  data: any[];
  isListEnd: boolean;
}

export const initialState: GetApiPagingState = {
  loading: false,
  moreLoading: false,
  error: false,
  moreError: false,
  data: [],
  isListEnd: false,
};

enum GetApiPagingActionKind {
  API_REQUEST = 'API_REQUEST',
  API_SUCCESS = 'API_SUCCESS',
  API_FAILURE = 'API_FAILURE',
  API_LIST_END = 'API_LIST_END',
  API_DATA_LIST = 'API_DATA_LIST',
}

interface GetApiPagingActionPayLoad {
  page: number;
  data: any[];
  error: boolean;
}

export interface GetApiPagingAction {
  type: GetApiPagingActionKind;
  payload: GetApiPagingActionPayLoad;
}

export function setApiRequest(page: number): GetApiPagingAction {
  return {
    type: GetApiPagingActionKind.API_REQUEST,
    payload: {page: page, data: [], error: false},
  };
}

export function setApiSuccess(data: any[]): GetApiPagingAction {
  return {
    type: GetApiPagingActionKind.API_SUCCESS,
    payload: {page: 0, data: data, error: false},
  };
}

export function setApiFail(): GetApiPagingAction {
  return {
    type: GetApiPagingActionKind.API_FAILURE,
    payload: {page: 0, data: [], error: true},
  };
}

export function setListEnd(): GetApiPagingAction {
  return {
    type: GetApiPagingActionKind.API_LIST_END,
    payload: {page: 0, data: [], error: true},
  };
}

export function setDataList(data: any[]): GetApiPagingAction {
  return {
    type: GetApiPagingActionKind.API_DATA_LIST,
    payload: {page: 0, data: data, error: true},
  };
}

export const userReducers = (
  state: GetApiPagingState,
  action: GetApiPagingAction,
) => {
  const {type, payload} = action;
  switch (type) {
    case GetApiPagingActionKind.API_REQUEST:
      if (payload.page === 1) {
        return {...state, data: [], loading: true, isListEnd: false};
      } else {
        return {...state, moreLoading: true};
      }

    case GetApiPagingActionKind.API_SUCCESS:
      return {
        ...state,
        data: [...state.data, ...payload.data],
        error: false,
        loading: false,
        moreLoading: false,
      };

    case GetApiPagingActionKind.API_FAILURE:
      return {
        ...state,
        error: payload.error,
        loading: false,
        moreLoading: false,
      };

    case GetApiPagingActionKind.API_LIST_END:
      return {
        ...state,
        isListEnd: true,
        loading: false,
        moreLoading: false,
      };

    case GetApiPagingActionKind.API_DATA_LIST:
      return {
        ...state,
        data: [...payload.data],
      };

    default:
      return state;
  }
};
