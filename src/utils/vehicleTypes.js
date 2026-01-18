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
  'Estacionamento Subsolo - Zona Mista',
  'Estacionamento Subsolo - Basement',
  'Estacionamento - Esfera',
  'Estacionamento Brita - Portão M',
  'Estacionamento Externo - Portão L',
  'Estacionamento Subsolo - R43 ao R37'
];

export const getVehicleType = (typeValue) => {
  return vehicleTypes.find(vt => vt.value === typeValue) || vehicleTypes[0];
};

export const brandColors = {
  primary: {
    light: '#3B82F6', // blue-500
    main: '#2563EB',  // blue-600
    dark: '#1D4ED8'   // blue-700
  },
  secondary: {
    light: '#8B5CF6', // purple-500
    main: '#7C3AED',  // purple-600
    dark: '#6D28D9'   // purple-700
  }
};