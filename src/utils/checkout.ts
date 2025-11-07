import {
  type ClientAddress,
  type ShippingOption,
  type AddShippingRequest,
} from '../services/api.ts';

export interface DeliveryFormData {
  postalCode: string;
  number: string;
  address: string;
  city: string;
  state: string;
  complement: string;
  province: string;
}

export const normalizeCEP = (cep: string): string => cep.replace(/\D/g, '');

export const mapDeliveryFormToClientAddress = (form: DeliveryFormData): ClientAddress => {
  return {
    postal_code: normalizeCEP(form.postalCode),
    number: (form.number || '').trim(),
    address: (form.address || '').trim(),
    city: (form.city || '').trim(),
    state: (form.state || '').trim(),
    complement: (form.complement || '').trim(),
    province: (form.province || '').trim(),
  };
};

export const isAddressDifferent = (
  stored: ClientAddress | null,
  current: ClientAddress
): boolean => {
  if (!stored) return true;

  const normalize = (v: string) => (v || '').toString().trim();

  return (
    normalize(stored.postal_code) !== normalize(current.postal_code) ||
    normalize(stored.number) !== normalize(current.number) ||
    normalize(stored.address) !== normalize(current.address) ||
    normalize(stored.city) !== normalize(current.city) ||
    normalize(stored.state) !== normalize(current.state) ||
    normalize(stored.complement) !== normalize(current.complement) ||
    normalize(stored.province) !== normalize(current.province)
  );
};

export const mapShippingOptionToAddShippingRequest = (
  option: ShippingOption
): AddShippingRequest => {
  return {
    service_id: option.id,
    service_name: option.name,
    price: Number.parseFloat(option.price),
    custom_price: Number.parseFloat(option.custom_price),
    delivery_time: option.delivery_time,
    custom_delivery_time: option.custom_delivery_time,
    currency: option.currency,
    company: option.company,
  };
};
