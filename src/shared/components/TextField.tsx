'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string; //전체 감싸는 div 태그에 추가로 넣을 tailwind 클래스
  inputClassName?: string; // input 자체에 추가로 넣을 tailwind 클래스
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, name, wrapperClassName = '', inputClassName = '', ...props }, ref) => {
    const inputId = id ?? name;

    return (
      <div className={wrapperClassName}>
        {label && (
          <label htmlFor={inputId} className="mb-2 block text-sm font-bold text-black">
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          className={`h-12 w-full rounded-xl border border-slate-500/40 bg-slate-100 px-4 text-sm text-slate-900 transition outline-none focus:border-yellow-300 ${inputClassName}`}
          {...props}
        />

        <div className="mt-2 h-5">{error && <p className="text-sm font-medium text-rose-400">{error}</p>}</div>
      </div>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
