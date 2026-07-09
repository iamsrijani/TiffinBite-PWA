import { useEffect, useState } from 'react';

const usePullToRefresh = (onRefresh) => {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let startY = 0;
    const handleTouchStart = (e) => { startY = e.touches[0].clientY; };
    const handleTouchEnd = async (e) => {
      const endY = e.changedTouches[0].clientY;
      if (endY - startY > 100 && window.scrollY === 0) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh]);

  return refreshing;
};

export default usePullToRefresh;
