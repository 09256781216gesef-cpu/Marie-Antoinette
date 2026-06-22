import { useWindowDimensions } from 'react-native';

export const TABLET_BREAKPOINT = 768;

export function useTabletLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  return { isTablet, screenWidth: width, screenHeight: height };
}
