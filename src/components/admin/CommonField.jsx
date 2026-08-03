// src/screens/OptionsScreen.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TableReusable from '../TableReusable';
import { getAllOptions, getGroupOptionsByOption, addOption, updateOption } from '../../hooks/useOptions';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

export const LabelTitle = ({ title }) => (
  <label className="text-[15px] font-bold text-slate-500 uppercase tracking-wider ml-1">
    {title}
  </label>
);

export const InputField = ({
  label,
  name,
  type = "text",
  value,
  placeholder,
  disabled,
  span = 1,
  onChange,
}) => (
  <div
    className={`flex flex-col gap-1.5 ${span > 1 ? `md:col-span-${span}` : ""}`}
  >
    <label className="text-[15px] font-bold text-slate-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        name={name}
        rows="3"
        value={value}
        onChange={onChange} // Usamos la propiedad
        disabled={disabled}
        placeholder={placeholder}
        className="p-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm text-slate-800 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
      />
    ) : (
      <input
        name={name}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={onChange} // Usamos la propiedad
        disabled={disabled}
        placeholder={placeholder}
        className="p-3 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all text-slate-800"
      />
    )}
  </div>
);

export default InputField;