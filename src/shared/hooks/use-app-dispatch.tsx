import { useDispatch } from 'react-redux';
import type { StoreDispatch } from '@shared/types/store';

export const useAppDispatch: () => StoreDispatch = useDispatch;