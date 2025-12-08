import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export const useSetState = (initialState) => {
  const [state, setState] = useState(initialState);
  const callbackRef = useRef(null);

  const updateState = useCallback((newState, callback) => {
    callbackRef.current = callback;
    setState(newState);
  }, []);

  useEffect(() => {
    if (callbackRef.current) {
      callbackRef.current();
      callbackRef.current = null;
    }
  }, [state]);

  return [
    state,
    updateState,
  ];
};
