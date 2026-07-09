import { useEffect } from 'react';

const useAppBadge = (count) => {
  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count);
      } else {
        navigator.clearAppBadge();
      }
    }
  }, [count]);
};

export default useAppBadge;
