import { LocalAuthLoader } from './local-auth-loader'
import type { AppAuthLoader } from '../../../typings'

export const authLoaders: AppAuthLoader[] = [LocalAuthLoader]
