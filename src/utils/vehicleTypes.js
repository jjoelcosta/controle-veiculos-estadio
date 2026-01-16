import { Car, Bike, Truck, Bus } from 'lucide-react';

export const vehicleTypes = [
  {
    value: 'Carro',
    icon: Car,
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    borderColor: 'border-blue-300'
  },
  {
    value: 'Moto',
    icon: Bike,
    iconColor: 'text-green-600',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    borderColor: 'border-green-300'
  },
  {
    value: 'Caminhão',
    icon: Truck,
    iconColor: 'text-orange-600',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
    borderColor: 'border-orange-300'
  },
  {
    value: 'Van',
    icon: Car,
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    borderColor: 'border-purple-300'
  },
  {
    value: 'Ônibus',
    icon: Bus,
    iconColor: 'text-red-600',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    borderColor: 'border-red-300'
  }
];

export const parkingLocations = [
  'Estacionamento A - VIP',
  'Estacionamento B - Imprensa',
  'Estacionamento C - Staff',
  'Estacionamento D - Geral Norte',
  'Estacionamento E - Geral Sul',
  'Estacionamento F - Eventos',
  'Estacionamento G - Administrativo',
  'Garagem Subsolo 1',
  'Garagem Subsolo 2',
  'Área Externa - Portão 1',
  'Área Externa - Portão 2',
  'Área de Carga e Descarga'
];

export const getVehicleType = (typeValue) => {
  return vehicleTypes.find(vt => vt.value === typeValue) || vehicleTypes[0];
};