import React, { useMemo } from 'react';
import { Music, Circle, Mail, MapPin, User, CalendarDays, Calculator, Phone, Link, Home, Building, CreditCard, Baby, Briefcase, Camera, Book, Gift, Clock, Languages, Star, Globe, School, Check, X, LucideIcon, Heart, Banknote, Car, Plane, Train, Bus, Bike, Coffee, UtensilsCrossed, Pizza, Cake, Tv, Film, Music2, Headphones, Smartphone, Laptop, Monitor, Printer, Wifi, Cloud, Sun, Moon, Umbrella, ThermometerSun, Wind, Droplets, Snowflake, Leaf, Trees, Flower2, Bird, Cat, Dog, Fish, Bug, Key, Lock, Unlock, Settings, Wrench, Search, Eye, EyeOff, Trash, Edit, Copy, Scissors, Download, Upload, Share, Send, MessageCircle, MessageSquare, AtSign, Hash, Percent, Plus, Minus, Divide, Equal, Info, AlertCircle, HelpCircle, BellRing, Dot } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { getLabelIcon } from './iconMapping';

interface ValueRendererProps {
  label?: string;
  value: Record<string, unknown> | unknown[] | string | number | boolean | null;
}

// Memoized helper functions to avoid recreation on each render
const isValidDate = (str: string) => {
  // Skip if the string is just a number
  if (/^\d+$/.test(str)) return false;
  const date = new Date(str);
  return date instanceof Date && !isNaN(date.getTime());
};

const isValidEmail = (str: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
};

const isGeoLocation = (str: string) => {
  const coordsRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  return coordsRegex.test(str);
};

const isGender = (str: string) => {
  const normalized = str.toLowerCase().trim();
  return ['male', 'female', 'non-binary'].includes(normalized);
};

// Separate components for different value types to optimize rendering
const BooleanValue = React.memo(({ value }: { value: boolean }) => (
  <div className={`inline-flex items-center px-3 py-1 rounded-full ${value ? 'bg-green-50' : 'bg-red-50'}`}>
    {value ? (
      <Check className="w-4 h-4 text-green-500 mr-2" />
    ) : (
      <X className="w-4 h-4 text-red-500 mr-2" />
    )}
    <span className="text-sm font-medium">{value ? 'True' : 'False'}</span>
  </div>
));

const NumberValue = React.memo(({ value }: { value: number }) => {
  if (value >= 0 && value <= 1) {
    return (
      <div className="space-y-1.5">
        <span className="text-sm text-gray-500">{(value * 100).toFixed(0)}%</span>
        <Progress value={value * 100} className="h-1.5" />
      </div>
    );
  }
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50">
      <span className="font-mono text-sm">
        {Number.isInteger(value) ? 
          value.toLocaleString() : 
          value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
});

const StringValue = React.memo(({ value }: { value: string }) => {
  const isShortString = value.length <= 20;
  const stringClassName = `text-gray-700 ${isShortString ? 'text-lg font-serif' : 'text-base'}`;

  // Color
  if (value.startsWith('#')) {
    return (
      <div className="inline-flex items-center space-x-2">
        <Circle className="w-5 h-5" fill={value} stroke={value} />
        <span className="font-mono text-sm">{value}</span>
      </div>
    );
  }
  
  // Music
  if (value.toLowerCase().includes('song') || value.toLowerCase().includes('music')) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50">
        <Music className="w-4 h-4 text-purple-500 mr-2" />
        <span className={`${stringClassName} text-purple-700`}>"{value}"</span>
      </div>
    );
  }
  
  // Date
  if (isValidDate(value)) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50">
        <CalendarDays className="w-4 h-4 text-orange-500 mr-2" />
        <span className="text-sm">{format(new Date(value), "PPpp")}</span>
      </div>
    );
  }
  
  // Email
  if (isValidEmail(value)) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50">
        <Mail className="w-4 h-4 text-green-500 mr-2" />
        <a href={`mailto:${value}`} className="text-green-600 hover:underline text-sm">
          {value}
        </a>
      </div>
    );
  }
  
  // Geo Location
  if (isGeoLocation(value)) {
    const [lat, lng] = value.split(',').map(coord => coord.trim());
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50">
        <MapPin className="w-4 h-4 text-indigo-500 mr-2" />
        <span className="text-sm">
          Lat: {lat}°, Long: {lng}°
        </span>
      </div>
    );
  }
  
  // Gender
  if (isGender(value)) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50">
        <User className="w-4 h-4 text-blue-500 mr-2" />
        <span className={`capitalize ${stringClassName} text-blue-700`}>{value}</span>
      </div>
    );
  }
  
  return <span className={stringClassName}>{value}</span>;
});

const ArrayValue = React.memo(({ value }: { value: unknown[] }) => (
  <div className="space-y-2 mt-1">
    {value.map((item, index) => (
      <div key={index} className="flex items-center">
        <Circle className="h-2 w-2 text-gray-500 -mr-2" />
        <ValueRenderer value={item as string | number | boolean | Record<string, unknown> | unknown[]} />
      </div>
    ))}
  </div>
));

const ObjectValue = React.memo(({ value }: { value: Record<string, unknown> }) => (
  <div className="space-y-2 mt-1 json-card">
    {Object.entries(value).map(([key, val]) => (
      <div key={key}>
        <ValueRenderer label={key} value={val as string | number | boolean | Record<string, unknown> | unknown[]} />
      </div>
    ))}
  </div>
));

export const ValueRenderer = React.memo(({ label, value }: ValueRendererProps) => {
  // Memoize the icon to prevent unnecessary re-renders
  const labelIcon = useMemo(() => {
    if (!label) return null;
    return getLabelIcon(label);
  }, [label]);

  const renderValue = () => {
    if (value === null) {
      return <span className="text-gray-600">null</span>;
    }

    switch (typeof value) {
      case 'boolean':
        return <BooleanValue value={value} />;
      case 'number':
        return <NumberValue value={value} />;
      case 'string':
        return <StringValue value={value} />;
      case 'object':
        if (Array.isArray(value)) {
          return <ArrayValue value={value} />;
        }
        return <ObjectValue value={value} />;
      default:
        return <span>{String(value)}</span>;
    }
  };

  return (
    <div className="json-entry hover:bg-gray-50/50 transition-colors">
      {label && (
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-1">
          {labelIcon && (
            <div className="text-gray-400">
              {React.createElement(labelIcon, { size: 15 })}
            </div>
          )}
          <span className="text-gray-800 font-semibold text-base">
            {label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:
          </span>
        </div>
      )}
      <div className="ml-5">
        {renderValue()}
      </div>
    </div>
  );
});
