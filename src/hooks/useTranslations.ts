import { useTranslations as useNextIntlTranslations } from 'next-intl';

export function useTranslations() {
  const t = useNextIntlTranslations();
  return t;
}

// Type-safe translation keys
export type TranslationKey =
  | 'common.navigation.home'
  | 'common.navigation.upload'
  | 'common.navigation.orders'
  | 'common.actions.upload'
  | 'common.actions.configure'
  | 'common.actions.checkout'
  | 'common.actions.pay'
  | 'common.actions.cancel'
  | 'common.errors.generic'
  | 'common.errors.upload'
  | 'common.errors.payment'
  | 'common.errors.required'
  | 'home.hero.title'
  | 'home.hero.subtitle'
  | 'home.hero.cta'
  | 'upload.title'
  | 'upload.description'
  | 'upload.dropzone.text'
  | 'upload.dropzone.hint'
  | 'configure.title'
  | 'configure.size.label'
  | 'configure.size.small'
  | 'configure.size.medium'
  | 'configure.size.large'
  | 'configure.material.label'
  | 'configure.material.paper'
  | 'configure.material.canvas'
  | 'configure.material.metal'
  | 'orders.title'
  | 'orders.empty'
  | 'orders.status.pending'
  | 'orders.status.processing'
  | 'orders.status.upscaling'
  | 'orders.status.printing'
  | 'orders.status.shipped'
  | 'orders.status.delivered';
