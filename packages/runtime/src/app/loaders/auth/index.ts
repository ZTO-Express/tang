import { IAMAuthLoader } from './iam-auth-loader'
import { LocalAuthLoader } from './local-auth-loader'
import type { AppAuthLoader } from '../../../typings'

export const authLoaders: AppAuthLoader[] = [IAMAuthLoader, LocalAuthLoader]
