import React from 'react';
import Button from '../ui/Button';
import { ArrowLeft } from 'lucide-react';
import InputField from "../fields/InputField";

export default function UsageSummaryForm({ onCancel }) {
  return (
    <div className='p-t4'>
      <div className="flex items-center space-x-2">
        <Button
          variant="icon"
          type="button"
          onClick={onCancel}
          className="p-1 -ml-2 mt-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className='text-2xl font-bold mt-2'>Usage Summary</h1>
      </div>
      <p className="opacity-70 mb-16">This is a read-only view. Data cannot be modified directly.</p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <InputField name="customer" label="Customer" disabled={true} />
        <InputField name="total_racks" label="Total Racks" disabled={true} />
        <InputField name="threshold_kw" label="Threshold (kW)" disabled={true} />
        <InputField name="total_consumption_kw" label="Total Consumption (kW)" disabled={true} />
        <InputField name="extra_consumption_kw" label="Extra Consumption (kW)" disabled={true} />
      </div>
      <div className='flex w-full justify-end mt-4 space-x-2'>
        <Button intent="cancel" type='button' onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  );
}