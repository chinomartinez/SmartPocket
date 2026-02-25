import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'border backdrop-blur-sm',
          error: '!bg-red-950/90 !border-red-800 !text-red-100',
          success: '!bg-emerald-950/90 !border-emerald-800 !text-emerald-100',
          warning: '!bg-yellow-950/90 !border-yellow-800 !text-yellow-100',
          info: '!bg-blue-950/90 !border-blue-800 !text-blue-100',
          title: '!text-current',
          description: '!text-current opacity-90',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
