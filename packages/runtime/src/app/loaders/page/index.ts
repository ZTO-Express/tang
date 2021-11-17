import { LocalPageLoader } from './local-page-loader'
import type { AppPageLoader } from '../../../typings'

export const pageLoaders: AppPageLoader[] = [LocalPageLoader]
